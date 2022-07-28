import util from 'util'
import SpotifyWebApi from 'spotify-web-api-node'
import { createCookie } from '@remix-run/node'
import sample from 'lodash/sample'
import random from 'lodash/random'
import db from './db'
import cache from './cache'
import auth from './auth'

interface SpotifyOptions {
  userAccessToken?: string | undefined
  refreshToken?: string | undefined | null
  country?: string
}

export class Spotify {
  private userAccessToken: SpotifyOptions['userAccessToken']
  private refreshToken: SpotifyOptions['refreshToken']
  private country: string
  private api: SpotifyWebApi
  private clientCredentialsTokenCacheKey = 'spotify-clientCredentialsToken'

  constructor(options: SpotifyOptions = {}) {
    this.userAccessToken = options.userAccessToken
    this.refreshToken = options.refreshToken
    this.country = options.country ?? 'US'
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

    return this.api
  }

  getRandomAlbumForSearchTerm = async (
    searchTerm: string,
    poolLimit = 1000
  ): Promise<SpotifyApi.AlbumObjectSimplified> => {
    const client = await this.getClient()

    const firstPage = await client.search(searchTerm, ['album'], {
      limit: 1,
    })

    if (!firstPage.body.albums?.total) {
      throw new Error('could not fetch first page of albums search term')
    }

    const albumOffsetToFetch = random(
      0,
      Math.min(firstPage.body.albums.total - 1, poolLimit)
    )

    if (albumOffsetToFetch === 0) {
      return firstPage.body.albums.items[0]
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
      })
      .then((resp) => resp.body.artists?.items?.[0])

    if (!artist) {
      throw new Error('not found: could not find artist with that name')
    }

    const firstPage = await client.getArtistAlbums(artist.id, {
      limit: 1,
      include_groups: 'album',
    })
    const offset = random(0, firstPage.body.total - 1)

    if (offset === 0) {
      return firstPage.body.items[0]
    }

    return client
      .getArtistAlbums(artist.id, {
        limit: 1,
        offset,
        include_groups: 'album',
        country: this.country,
      })
      .then((resp) => resp.body.items[0])
  }

  getRandomAlbumByGenre = async (
    genre: string
  ): Promise<SpotifyApi.AlbumObjectSimplified | null> => {
    // First, we must fetch a random artist in this genre
    const limit = 1
    const searchTerm = `genre:"${genre}"`
    const client = await this.getClient()
    const firstPageOfArtists = await client.search(searchTerm, ['artist'], {
      limit,
      market: this.country,
    })

    if (!firstPageOfArtists.body.artists?.total) {
      throw new Error('could not fetch first page of artists')
    }

    const artistOffsetToFetch = random(
      0,
      Math.min(firstPageOfArtists.body.artists.total - 1, 300)
    )

    let artistID = firstPageOfArtists.body.artists.items[0].id

    if (artistOffsetToFetch > 0) {
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
        page.body.items.filter((album) => album.album_type !== 'single')
      )

    if (!albums.length) {
      return this.getRandomAlbumByGenre(genre)
    }

    return sample(albums) ?? null
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

    // Next, we need to fetch the related artists
    const relatedArtists = await client.getArtistRelatedArtists(artist.id)

    if (relatedArtists.statusCode !== 200) {
      throw new Error('could not fetch related artists')
    }

    // Find a random related artist (or the artist that was provided in the
    // original search term)
    const targetArtist = sample([...relatedArtists.body.artists, artist])

    if (!targetArtist) {
      throw new Error('could not sample to find target artist')
    }

    // Finally, return a random album from the targetArtist
    return this.getRandomAlbumForSearchTerm(`artist:"${targetArtist.name}"`)
  }

  getRandomAlbumForPublication = async (
    publicationSlug: string
  ): Promise<{
    review: Awaited<ReturnType<typeof db.getRandomAlbumForPublication>>
    album: SpotifyApi.AlbumObjectSimplified
  }> => {
    const review = await db.getRandomAlbumForPublication(publicationSlug)
    const album = await this.getAlbum(review.album, review.aritst)

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

  getRandomAlbumFromUserLibrary = async () => {
    if (!this.userAccessToken) {
      throw new Error('User must be logged in to use this')
    }

    const client = await this.getClient()
    const firstPage = await client.getMySavedAlbums({
      limit: 1,
      market: this.country,
    })

    const targetOffset = random(0, firstPage.body.total)

    if (targetOffset === 0) {
      return firstPage.body.items[0].album
    }

    return client
      .getMySavedAlbums({
        offset: targetOffset,
        limit: 1,
        market: this.country,
      })
      .then((resp) => resp.body.items[0].album)
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
    const currentlyPlayingItem = playerState.item

    if (
      playerState.currently_playing_type !== 'track' ||
      !currentlyPlayingItem ||
      !('album' in currentlyPlayingItem)
    ) {
      throw new Error('User must be listening to music to do this')
    }

    return this.getRandomAlbumForRelatedArtist(
      currentlyPlayingItem.artists[0].name
    )
  }

  getRandomNewRelease = async () => {
    const client = await this.getClient()
    const resp = await client.getNewReleases({
      country: this.country,
      limit: 50,
      offset: random(0, 49),
    })

    return resp.body.albums.items[0]
  }

  getRandomFeaturedPlaylist = async () => {
    const client = await this.getClient()
    let resp = await client.getFeaturedPlaylists({
      country: this.country,
      limit: 1,
      offset: random(0, 49),
    })

    if (resp.body.playlists.items.length === 0) {
      resp = await client.getFeaturedPlaylists({
        country: this.country,
        limit: 1,
        offset: random(0, resp.body.playlists.total - 1),
      })
    }

    return resp.body.playlists.items[0]
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

  getRandomPlaylistForCategory = async (categoryID: string) => {
    const client = await this.getClient()
    const firstPage = await client.getPlaylistsForCategory(categoryID, {
      country: this.country,
      limit: 1,
    })
    const playlistIdx = random(0, firstPage.body.playlists.total - 1)

    if (playlistIdx === 0) {
      return firstPage.body.playlists.items[0]
    }

    const playlistResp = await client.getPlaylistsForCategory(categoryID, {
      country: this.country,
      limit: 1,
      offset: playlistIdx,
    })

    return playlistResp.body.playlists.items[0]
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
  const cookie = await auth.getCookie(req)
  const options: SpotifyOptions = {}

  if ('accessToken' in cookie.spotify) {
    options.userAccessToken = cookie.spotify.accessToken
    options.refreshToken = cookie.spotify.refreshToken
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
}

export default api
