import { AppLoadContext, createCookie } from '@remix-run/node'
import * as Sentry from '@sentry/remix'
import pick from 'lodash/pick'
import random from 'lodash/random'
import sample from 'lodash/sample'
import sampleSize from 'lodash/sampleSize'
import SpotifyWebApi from 'spotify-web-api-node'
import { WebapiError as SpotifyWebApiError } from 'spotify-web-api-node/src/response-error'
import util from 'util'
import type { Logger } from 'winston'

import { spotifyStrategy } from '~/lib/auth.server'
import cache from '~/lib/cache.server'
import userSettings from '~/lib/userSettings.server'

import type { SpotifyArtist, SpotifyUser } from './types/spotify'

interface SpotifyOptions {
  userAccessToken?: string | undefined
  refreshToken?: string | undefined | null
  country?: string
  lastPresentedID?: string | null
  logger?: Logger
  clientID: string
  clientSecret: string
}

export class Spotify {
  private userAccessToken: SpotifyOptions['userAccessToken']
  private refreshToken: SpotifyOptions['refreshToken']
  private country: string
  private lastPresentedID: SpotifyOptions['lastPresentedID']
  private api: SpotifyWebApi
  private clientCredentialsTokenCacheKey = 'spotify-clientCredentialsToken'
  private logger?: Logger

  constructor(options: SpotifyOptions) {
    this.userAccessToken = options.userAccessToken
    this.refreshToken = options.refreshToken
    this.country = options.country ?? 'US'
    this.lastPresentedID = options.lastPresentedID
    this.logger = options.logger
    this.api = new SpotifyWebApi({
      clientId: options.clientID,
      clientSecret: options.clientSecret,
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
      get: (target, propKey, receiver) => {
        // @ts-ignore
        const originalMethod = target?.[propKey]

        if (typeof originalMethod === 'function') {
          // @ts-ignore
          return (...args) => {
            const methodName = propKey.toString()
            const shouldTrack =
              methodName !== 'getAccessToken' && !methodName.startsWith('_')
            let transaction:
              | ReturnType<typeof Sentry.startTransaction>
              | undefined

            if (shouldTrack) {
              transaction = Sentry.startTransaction({
                op: 'spotify',
                name: propKey.toString(),
              })

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
              // @ts-ignore
              const res = originalMethod.apply(this.api, args)

              if (
                typeof res === 'object' &&
                typeof res.finally === 'function'
              ) {
                return res.finally(() => transaction?.finish?.())
              }

              return res
            } catch (e: any) {
              if (e instanceof SpotifyWebApiError) {
                if (e.statusCode === 429) {
                  this.logger?.error({
                    message: 'Spotify is rate limiting the application!',
                    exceptionMessage: e.message,
                    body: e.body,
                    headers: e.headers,
                    statusCode: e.statusCode,
                    email: true,
                    method: propKey,
                  })
                } else {
                  this.logger?.warn({
                    message: 'Spotify threw an exception',
                    exceptionMessage: e.message,
                    body: e.body,
                    headers: e.headers,
                    statusCode: e.statusCode,
                    method: propKey,
                  })
                }
              }

              throw e
            } finally {
              // If it dies, it dies
              try {
                transaction?.finish?.()
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

  getRandomAlbumForArtistByID = async (artistID: string) => {
    const client = await this.getClient()
    const artistPromise = client.getArtist(artistID)
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

    if (!album) {
      throw new Error('could not fetch album from that offset, please retry')
    } else if (album.id === this.lastPresentedID) {
      throw new Error('album is the one we last presented, please retry')
    }

    const artist = await artistPromise

    // Shuffle the genres, keeping the first one in it's place
    let genres = artist.body.genres

    if (genres.length > 2) {
      genres = [genres[0], ...sampleSize(genres.slice(1), genres.length - 1)]
    }

    return {
      ...album,
      artists: [artist.body],
      genres,
    }
  }

  getRandomAlbumByGenre = async (genre: string) => {
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
      throw new Error(
        'could not fetch an album for this artist from this genre'
      )
    }

    const album = sample(albums) ?? albums[0]

    return {
      ...album,
      genres: await this.getGenreForArtist(album.artists[0].id),
    }
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

  async getRandomAlbumForLabel(label: string) {
    return this.getRandomAlbumForSearchTerm(`label:"${label}"`, 500)
  }

  async getArtistByID(artistID: string) {
    const client = await this.getClient()
    const resp = await client.getArtist(artistID)
    return resp.body
  }

  async getGenreForArtist(artistID: string) {
    const artist = await this.getArtistByID(artistID)
    return artist.genres
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
        return {
          ...albums[0],
          // @TODO Maybe one day, we could defer this as an unresolved provmise
          // using Remix? This doubles the response time of this function and is
          // somewhat non-critical.
          genres: await this.getGenreForArtist(albums[0].artists[0].id),
        }
      default: {
        const album = albums.sort((a) => (a.album_type !== 'single' ? 1 : 0))[0]

        return {
          ...album,
          genres: await this.getGenreForArtist(album.artists[0].id),
        }
      }
    }
  }

  getRandomAlbumFromUserLibrary = async () => {
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

    if (!album) {
      throw new Error('could not fetch album from that offset, please retry')
    } else if (album.id === this.lastPresentedID) {
      throw new Error('we just presented this album, please retry')
    }

    return {
      ...album,
      genres: await this.getGenreForArtist(album.artists[0].id),
    }
  }

  getRandomAlbumSimilarToWhatIsCurrentlyPlaying = async () => {
    if (!this.userAccessToken) {
      throw new Error('User must be logged in to use this')
    }

    const currentlyPlaying = await this.getCurrentlyPlayingTrack()
    const album = await this.getRandomAlbumForRelatedArtistByID(
      currentlyPlaying.artists[0].id
    )

    return {
      album,
      currentlyPlaying,
    }
  }

  getCurrentlyPlayingTrack = async () => {
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

    return currentlyPlaying
  }

  getRandomNewRelease = async () => {
    const client = await this.getClient()
    const resp = await client.getNewReleases({
      country: this.country,
      limit: 50,
      offset: random(0, 49),
    })
    const album = resp.body.albums.items[0]

    if (album.id === this.lastPresentedID) {
      throw new Error('selected album that was last presented, please retry')
    }

    return {
      ...album,
      genres: await this.getGenreForArtist(album.artists[0].id),
    }
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

  getUser = async (): Promise<SpotifyUser | null> => {
    if (!this.userAccessToken) {
      return null
    }

    try {
      const client = await this.getClient()
      const resp = await client.getMe()
      const user = resp.body

      return pick(user, ['id', 'display_name', 'href', 'images', 'uri'])
    } catch (e) {
      return null
    }
  }

  followArtist = async (artistIDs: string | string[]) => {
    const client = await this.getClient()
    return client.followArtists(
      Array.isArray(artistIDs) ? artistIDs : [artistIDs]
    )
  }

  saveAlbum = async (albumID: string) => {
    const client = await this.getClient()
    return client.addToMySavedAlbums([albumID])
  }

  getRelatedArtists = async (artistID: string) => {
    const client = await this.getClient()
    const resp = await client.getArtistRelatedArtists(artistID)
    return resp.body.artists
  }

  getRandomForYouPlaylist = async () => {
    if (!this.userAccessToken) {
      throw new Error('User must be logged in to use this')
    }

    const client = await this.getClient()
    const resp = await client.search('for you', ['playlist'], {
      limit: 50,
      market: this.country,
    })

    if (!resp.body.playlists || !resp.body.playlists.total) {
      throw new Error('Could not find any playlists')
    }

    const playlistsBySpotify = resp.body.playlists.items.filter(
      (p) => p.owner.uri === 'spotify:user:spotify'
    )

    while (true) {
      const playlist = sample(playlistsBySpotify)

      if (playlist && playlist.id !== this.lastPresentedID) {
        return playlist
      }
    }
  }
}

const cookieFactory = createCookie('spotify', {
  maxAge: 3600,
})

const initializeFromRequest = async (req: Request, context: AppLoadContext) => {
  const session = await spotifyStrategy.getSession(req)
  const settings = await userSettings.get(req)
  const [currentSearchType] = userSettings.getCurrentSearchFromRequest(req)
  const options: SpotifyOptions = {
    lastPresentedID: undefined,
    logger: context?.logger,
    clientID: context.env.SPOTIFY_CLIENT_ID,
    clientSecret: context.env.SPOTIFY_CLIENT_SECRET,
  }

  if (settings.lastPresented && settings.lastSearchType === currentSearchType) {
    options.lastPresentedID = settings.lastPresented
  }

  if (session?.accessToken) {
    options.userAccessToken = session.accessToken
    options.refreshToken = session.refreshToken
  }

  // Netlify forwards the country based upon geoip
  // https://developers.cloudflare.com/fundamentals/get-started/reference/http-request-headers/#cf-ipcountry
  options.country = req.headers.get('cf-ipcountry') ?? undefined

  const url = new URL(req.url)

  if (url.searchParams.get('country')) {
    options.country = url.searchParams.get('country') || undefined
  }

  return new Spotify(options)
}

const api = {
  initializeFromRequest,
  cookieFactory,
}

export default api
