import util from 'util'
import SpotifyWebApi from 'spotify-web-api-node'
import * as Sentry from '@sentry/remix'
import { createCookie } from '@remix-run/node'
import sample from 'lodash/sample'
import random from 'lodash/random'
import pick from 'lodash/pick'

import db from '~/lib/db.server'
import cache from '~/lib/cache.server'
import auth from '~/lib/auth.server'
import lastPresented from '~/lib/lastPresented.server'
import type { SpotifyArtist } from './types/spotify'

interface SpotifyOptions {
  userAccessToken?: string | undefined
  refreshToken?: string | undefined | null
  country?: string
  lastPresentedID?: string | null
}

export class Spotify {
  private userAccessToken: SpotifyOptions['userAccessToken']
  private refreshToken: SpotifyOptions['refreshToken']
  private country: string
  private lastPresentedID: SpotifyOptions['lastPresentedID']
  private api: SpotifyWebApi
  private clientCredentialsTokenCacheKey = 'spotify-clientCredentialsToken'

  constructor(options: SpotifyOptions = {}) {
    this.userAccessToken = options.userAccessToken
    this.refreshToken = options.refreshToken
    this.country = options.country ?? 'US'
    this.lastPresentedID = options.lastPresentedID
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri:
        process.env.NODE_ENV === 'production'
          ? 'https://album-mode.party/spotify/callback'
          : 'http://localhost:3000/spotify/callback',
    })
  }

  getClient = async () => {
    if (this.userAccessToken) {
      this.api.setAccessToken(this.userAccessToken)

      if (this.refreshToken) {
        this.api.setRefreshToken(this.refreshToken)
      }
    } else if (!this.api.getAccessToken()) {
      let token = cache.get<string>(this.clientCredentialsTokenCacheKey)

      if (!token) {
        const data = await this.api.clientCredentialsGrant()
        token = data.body.access_token
        cache.set(
          this.clientCredentialsTokenCacheKey,
          token,
          data.body.expires_in
        )
      }

      this.api.setAccessToken(token)
    }

    // Wrap the SpotifyApi in a proxy that will automatically trace and leave
    // breadcrumbs for all Spotify requests to Sentry.
    return new Proxy(this.api, {
      get(target, propKey, receiver) {
        const originalMethod = target?.[propKey]

        if (typeof originalMethod === 'function') {
          return function (...args) {
            const transaction = Sentry.startTransaction({
              op: 'spotify',
              name: propKey.toString(),
            })

            if (
              !propKey.toString().startsWith('_') &&
              propKey.toString() !== 'getAccessToken'
            ) {
              Sentry.addBreadcrumb({
                type: 'spotify',
                category: 'spotify',
                level: 'debug',
                message: propKey.toString(),
                data: args.reduce((acc, curr, i) => {
                  acc[i] = curr
                  return acc
                }, {}),
              })
            }

            try {
              const res = originalMethod.apply(this, args)

              if (
                typeof res === 'object' &&
                typeof res.finally === 'function'
              ) {
                return res.finally(() => transaction.finish())
              }

              return res
            } finally {
              // If it dies, it dies
              try {
                transaction.finish()
              } catch (e) {}
            }
          }
        }

        return Reflect.get(target, propKey, receiver)
      },
    })
  }

  getRandomAlbumForSearchTerm = async (
    searchTerm: string,
    poolLimit = 1000
  ): Promise<SpotifyApi.AlbumObjectSimplified> => {
    const client = await this.getClient()

    const firstPage = await client.search(searchTerm, ['album'], {
      market: this.country,
    })

    if (!firstPage.body.albums?.total) {
      throw new Error('could not fetch first page of albums search term')
    }

    const albumOffsetToFetch = random(
      0,
      Math.min(firstPage.body.albums.total - 1, poolLimit)
    )

    if (albumOffsetToFetch < firstPage.body.albums.items.length - 1) {
      return firstPage.body.albums.items[albumOffsetToFetch]
    }

    const resp = await client.search(searchTerm, ['album'], {
      limit: 1,
      offset: albumOffsetToFetch,
      market: this.country,
    })

    if (!resp.body.albums?.items?.[0]) {
      console.error(util.inspect(resp, false, 100000, true), albumOffsetToFetch)
      throw new Error(
        `could not fetch album for search term from offset (Spotify status code: ${resp.statusCode})`
      )
    }

    const album = resp.body.albums.items[0]

    if (album.album_type === 'single') {
      return this.getRandomAlbumForSearchTerm(searchTerm, poolLimit)
    }

    return album
  }

  getRandomAlbumForArtist = async (artistName: string) => {
    const client = await this.getClient()
    const artist = await client
      .search(`artist:"${artistName}"`, ['artist'], {
        limit: 1,
        market: this.country,
      })
      .then((resp) => resp.body.artists?.items?.[0])

    if (!artist) {
      throw new Error('not found: could not find artist with that name')
    }

    return this.getRandomAlbumForArtistByID(artist.id)
  }

  getRandomAlbumForArtistByID = async (
    artistID: string
  ): Promise<SpotifyApi.AlbumObjectSimplified> => {
    const client = await this.getClient()
    let resp = await client.getArtistAlbums(artistID, {
      include_groups: 'album',
      country: this.country,
    })
    let offset = random(0, Math.max(resp.body.total - 1, 0))

    if (offset > resp.body.items.length - 1) {
      resp = await client.getArtistAlbums(artistID, {
        limit: 1,
        offset,
        include_groups: 'album',
        country: this.country,
      })
      offset = 0
    }

    const album = resp.body.items[offset]

    if (!album || album.id === this.lastPresentedID) {
      return this.getRandomAlbumForArtistByID(artistID)
    }

    return album
  }

  getRandomAlbumByGenre = async (
    genre: string
  ): Promise<SpotifyApi.AlbumObjectSimplified> => {
    // First, we must fetch a random artist in this genre
    const searchTerm = `genre:"${genre}"`
    const client = await this.getClient()
    const firstPageOfArtists = await client.search(searchTerm, ['artist'], {
      market: this.country,
    })

    if (!firstPageOfArtists.body.artists?.total) {
      throw new Error('could not fetch first page of artists')
    }

    const artistOffsetToFetch = random(
      0,
      Math.min(firstPageOfArtists.body.artists.total - 1, 300)
    )

    let artistID =
      firstPageOfArtists.body.artists.items[artistOffsetToFetch]?.id

    if (!artistID) {
      const artist = await client
        .search(searchTerm, ['artist'], {
          limit: 1,
          offset: artistOffsetToFetch,
          market: this.country,
        })
        .then((page) => page.body.artists?.items?.[0])

      if (!artist) {
        throw new Error('could not fetch artist from offset')
      }

      artistID = artist.id
    }

    // After we fetch a random artist, fetch a random album by them
    const albums = await client
      .getArtistAlbums(artistID, {
        limit: 50,
        include_groups: 'album',
      })
      .then((page) =>
        page.body.items.filter(
          (album) =>
            album.album_type !== 'single' &&
            (!this.lastPresentedID || album.id !== this.lastPresentedID)
        )
      )

    if (!albums.length) {
      return this.getRandomAlbumByGenre(genre)
    }

    return sample(albums) ?? albums[0]
  }

  getRandomAlbumForRelatedArtist = async (artistName: string) => {
    const client = await this.getClient()
    // First, we have to fetch the artist to get it's ID
    const artist = await client
      .search(`artist:"${artistName}"`, ['artist'], {
        limit: 1,
        market: this.country,
      })
      .then((resp) => resp.body.artists?.items?.[0])

    if (!artist) {
      throw new Error('could not find artist with that name')
    }

    return this.getRandomAlbumForRelatedArtistByID(artist.id)
  }

  getRandomAlbumForRelatedArtistByID = async (artistID: string) => {
    const client = await this.getClient()
    // Next, we need to fetch the related artists
    const relatedArtists = await client.getArtistRelatedArtists(artistID)

    if (relatedArtists.statusCode !== 200) {
      throw new Error('could not fetch related artists')
    }

    // Find a random related artist (or the artist that was provided in the
    // original search term)
    const targetArtistID = sample([
      artistID,
      ...relatedArtists.body.artists.map((a) => a.id),
      artistID,
    ])

    if (!targetArtistID) {
      throw new Error('could not sample to find target artist')
    }

    // Finally, return a random album from the targetArtist
    return this.getRandomAlbumForArtistByID(targetArtistID)
  }

  getRandomAlbumForPublication = async (
    publicationSlug: string
  ): Promise<{
    review: Awaited<ReturnType<typeof db.getRandomAlbumForPublication>>
    album: SpotifyApi.AlbumObjectSimplified
  }> => {
    const review = await db.getRandomAlbumForPublication({
      publicationSlug,
      exceptID: this.lastPresentedID,
    })
    const album = await this.getAlbum(review.album, review.artist)

    if (!album) {
      return this.getRandomAlbumForPublication(publicationSlug)
    }

    return { review, album }
  }

  async getRandomAlbumForLabel(label: string) {
    return this.getRandomAlbumForSearchTerm(`label:"${label}"`, 500)
  }

  async getAlbum(album: string, artist: string) {
    const client = await this.getClient()
    const resp = await client.search(
      `album:"${album}" artist:"${artist}"`,
      ['album'],
      {
        limit: 50,
        market: this.country,
      }
    )
    const albums = resp.body?.albums?.items ?? []

    switch (albums.length) {
      case 0:
        throw new Error('could not locate album by searching Spotify')
      case 1:
        return albums[0]
      default:
        return albums.filter((album) => album.album_type !== 'single')[0]
    }
  }

  getRandomAlbumFromUserLibrary =
    async (): Promise<SpotifyApi.AlbumObjectFull> => {
      if (!this.userAccessToken) {
        throw new Error('User must be logged in to use this')
      }

      const client = await this.getClient()
      let resp = await client.getMySavedAlbums({
        market: this.country,
      })
      let offset = random(0, resp.body.total - 1)

      if (offset > resp.body.items.length - 1) {
        resp = await client.getMySavedAlbums({
          offset,
          limit: 1,
          market: this.country,
        })
        offset = 0
      }

      const album = resp.body.items[offset]?.album

      if (!album || album.id === this.lastPresentedID) {
        return this.getRandomAlbumFromUserLibrary()
      }

      return album
    }

  getRandomAlbumSimilarToWhatIsCurrentlyPlaying = async () => {
    if (!this.userAccessToken) {
      throw new Error('User must be logged in to use this')
    }

    const client = await this.getClient()
    const playerState = await client
      .getMyCurrentPlaybackState({
        market: this.country,
      })
      .then((resp) => resp.body)
    const currentlyPlaying = playerState.item

    if (
      playerState.currently_playing_type !== 'track' ||
      !currentlyPlaying ||
      !('album' in currentlyPlaying)
    ) {
      throw new Error('User must be listening to music to do this')
    }

    const album = await this.getRandomAlbumForRelatedArtistByID(
      currentlyPlaying.artists[0].id
    )

    return {
      album,
      currentlyPlaying,
    }
  }

  getRandomNewRelease = async (): Promise<SpotifyApi.AlbumObjectSimplified> => {
    const client = await this.getClient()
    const resp = await client.getNewReleases({
      country: this.country,
      limit: 50,
      offset: random(0, 49),
    })
    const album = resp.body.albums.items[0]

    if (album.id === this.lastPresentedID) {
      return this.getRandomNewRelease()
    }

    return album
  }

  getRandomFeaturedPlaylist =
    async (): Promise<SpotifyApi.PlaylistObjectSimplified> => {
      const client = await this.getClient()
      let resp = await client.getFeaturedPlaylists({
        country: this.country,
      })
      let offset = random(0, resp.body.playlists.total - 1)

      if (offset > resp.body.playlists.items.length - 1) {
        resp = await client.getFeaturedPlaylists({
          country: this.country,
          limit: 1,
          offset,
        })
        offset = 0
      }

      const playlist = resp.body.playlists.items[offset]

      if (playlist.id === this.lastPresentedID) {
        return this.getRandomFeaturedPlaylist()
      }

      return playlist
    }

  getCategories = async () => {
    const cacheKey = `spotify-categories-${this.country}`
    let categories = cache.get<SpotifyApi.CategoryObject[]>(cacheKey)

    if (categories) {
      return categories
    }

    const client = await this.getClient()
    const resp = await client.getCategories({
      country: this.country,
      limit: 50,
    })

    categories = resp.body.categories.items
    cache.set(cacheKey, categories)

    return categories
  }

  getCategory = async (categoryID: string) => {
    const categories = await this.getCategories()
    return categories.find((category) => category.id === categoryID)
  }

  getRandomPlaylistForCategory = async (
    categoryID: string
  ): Promise<SpotifyApi.PlaylistObjectSimplified> => {
    const client = await this.getClient()
    let resp = await client.getPlaylistsForCategory(categoryID, {
      country: this.country,
    })
    let offset = random(0, resp.body.playlists.total - 1)

    if (offset > resp.body.playlists.items.length - 1) {
      resp = await client.getPlaylistsForCategory(categoryID, {
        country: this.country,
        limit: 1,
        offset,
      })
      offset = 0
    }

    const playlist = resp.body.playlists.items[offset]

    if (!playlist || playlist.id === this.lastPresentedID) {
      return this.getRandomPlaylistForCategory(categoryID)
    }

    return playlist
  }

  getRandomAlbumForGroupSlug = async (groupSlug: string) => {
    const artist = await db.getRandomArtistFromGroupSlug(groupSlug)

    if (!artist) {
      throw new Error(`Could not find artist under group slug '${groupSlug}'`)
    }

    return this.getRandomAlbumForSearchTerm(`artist:"${artist.name}"`)
  }

  getRandomAlbumForLabelSlug = async (labelSlug: string) => {
    const label = await db.getLabelBySlug(labelSlug)

    if (!label) {
      throw new Error(`Could not find label for slug '${labelSlug}'`)
    }

    return this.getRandomAlbumForLabel(label.name)
  }

  searchArists = async (term: string): Promise<SpotifyArtist[]> => {
    const client = await this.getClient()
    const results = await client.search(term, ['artist'], {
      market: this.country,
    })

    return (
      results.body.artists?.items.map((artist) => ({
        name: artist.name,
        id: artist.id,
        image: artist.images.at(-1),
      })) ?? []
    )
  }

  getTopArtists = async (): Promise<SpotifyArtist[]> => {
    const cacheKey = `spotify-topArtists-${this.country}`
    let artists = cache.get<SpotifyArtist[]>(cacheKey)

    if (artists) {
      return artists
    }

    const client = await this.getClient()
    // https://open.spotify.com/playlist/37i9dQZEVXbLp5XoPON0wI?si=ec81b7dcedf843a4
    const topSongsPlaylist = await client.getPlaylist('37i9dQZEVXbLp5XoPON0wI')
    const topArtistIDs = topSongsPlaylist.body.tracks.items.reduce(
      (acc, track) => {
        const artistID = track.track?.artists[0].id

        if (artistID) {
          acc.add(artistID)
        }

        return acc
      },
      new Set<string>()
    )
    const artistsResp = await client.getArtists([...topArtistIDs])
    artists = artistsResp.body.artists.map((artist) => ({
      name: artist.name,
      id: artist.id,
      image: artist.images.at(-1),
    }))
    cache.set(cacheKey, artists)

    return artists
  }

  getRandomTopArtist = async () => {
    const artists = await this.getTopArtists()
    return sample(artists) ?? artists[0]
  }

  getUser = async () => {
    if (!this.userAccessToken) {
      throw new Error('User must be logged in to use this')
    }

    const client = await this.getClient()
    const resp = await client.getMe()
    const user = resp.body

    return pick(user, ['id', 'display_name', 'href', 'images', 'uri'])
  }
}

const spotifyAPIFactory = () =>
  new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri:
      process.env.NODE_ENV === 'production'
        ? 'https://album-mode.party/spotify/callback'
        : 'http://localhost:3000/spotify/callback',
  })

export const spotifyAPI = spotifyAPIFactory()

export const getMachineClient = async () => {
  const client = spotifyAPIFactory()

  if (!client.getAccessToken()) {
    await client
      .clientCredentialsGrant()
      .then(({ body }) => client.setAccessToken(body.access_token))
  }

  return client
}

const getUserClient = (accessToken: string, refreshToken?: string) => {
  const api = spotifyAPIFactory()
  api.setAccessToken(accessToken)

  if (refreshToken) {
    api.setRefreshToken(refreshToken)
  }

  return api
}

const cookieFactory = createCookie('spotify', {
  maxAge: 3600,
})

const initializeFromRequest = async (req: Request) => {
  const authCookie = await auth.getCookie(req)
  const options: SpotifyOptions = {
    lastPresentedID: await lastPresented.getLastPresentedID(req),
  }

  if ('accessToken' in authCookie.spotify) {
    options.userAccessToken = authCookie.spotify.accessToken
    options.refreshToken = authCookie.spotify.refreshToken
  }

  // Netlify forwards the country based upon geoip in the x-country header
  // https://answers.netlify.com/t/user-location-in-headers/11937/3
  if (req.headers.get('x-country')) {
    options.country = req.headers.get('x-country') || undefined
  }

  const url = new URL(req.url)

  if (url.searchParams.get('country')) {
    options.country = url.searchParams.get('country') || undefined
  }

  return new Spotify(options)
}

const api = {
  initializeFromRequest,
  cookieFactory,
  spotifyAPI,
  getUserClient,
  getMachineClient,
}

export default api
