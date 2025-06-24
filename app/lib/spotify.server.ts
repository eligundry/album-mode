import { AppLoadContext, createCookie } from '@remix-run/node'
import {
  AccessToken,
  ItemTypes,
  Market,
  MaxInt,
  SdkOptions,
  SimplifiedAlbum,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk'
import crypto from 'crypto'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import random from 'lodash/random'
import sample from 'lodash/sample'
import sampleSize from 'lodash/sampleSize'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import { scopes as spotifyScopes, spotifyStrategy } from '~/lib/auth.server'
import { getRequestContextValues } from '~/lib/context.server'
import { blockBots } from '~/lib/responses.server'
import type { SpotifyArtist, SpotifyUser } from '~/lib/types/spotify'
import userSettings from '~/lib/userSettings.server'

interface SpotifyOptions {
  sdkOptions?: SdkOptions
  accessToken?: AccessToken
  country?: Market
  lastPresentedID?: string | null
  clientID: string
  clientSecret: string
}

export class Spotify {
  private country: Market
  private lastPresentedID: SpotifyOptions['lastPresentedID']
  private api: SpotifyApi

  constructor(options: SpotifyOptions) {
    this.country = options.country ?? 'US'
    this.lastPresentedID = options.lastPresentedID

    if (options.accessToken) {
      this.api = SpotifyApi.withAccessToken(
        options.clientID,
        options.accessToken,
        options.sdkOptions,
      )
    } else {
      this.api = SpotifyApi.withClientCredentials(
        options.clientID,
        options.clientSecret,
        spotifyScopes,
        options.sdkOptions,
      )
    }
  }

  getClient = async () => {
    return this.api
  }

  getRandomAlbumForSearchTerm = async (
    searchTerm: string,
    poolLimit = 1000,
  ): Promise<SimplifiedAlbum> => {
    const firstPage = await this.search({
      value: searchTerm,
      type: ['album'],
    })
    console.log('firstPage', firstPage)

    if (!firstPage.albums?.total) {
      throw new Error('could not fetch first page of albums search term')
    }

    const albumOffsetToFetch = random(
      0,
      // Math.min(firstPage.albums.total - 1, poolLimit),
      Math.min(firstPage.albums.total - 1, 5),
    )

    if (albumOffsetToFetch < firstPage.albums.items.length - 1) {
      return firstPage.albums.items[albumOffsetToFetch]
    }

    const resp = await this.search({
      value: searchTerm,
      type: ['album'],
      limit: 1,
      offset: albumOffsetToFetch,
    })
    console.log('resp', resp)

    if (!resp.albums?.items?.[0]) {
      throw new Error(`could not fetch album for search term from offset`)
    }

    const album = resp.albums.items[0]

    if (album.album_type === 'single') {
      return this.getRandomAlbumForSearchTerm(searchTerm, poolLimit)
    }

    return album
  }

  getRandomAlbumForArtist = async (artistName: string) => {
    const artist = await this.search({
      artist: artistName,
      type: ['artist'],
      limit: 1,
    }).then((resp) => resp.artists?.items?.[0])

    if (!artist) {
      throw new Error('not found: could not find artist with that name')
    }

    return this.getRandomAlbumForArtistByID(artist.id)
  }

  getRandomAlbumForArtistByID = async (artistID: string) => {
    const artistPromise = this.api.artists.get(artistID)
    let resp = await this.api.artists.albums(artistID, 'album', this.country)
    let offset = random(0, Math.max(resp.total - 1, 0))

    if (offset > resp.items.length - 1) {
      resp = await this.api.artists.albums(
        artistID,
        'album',
        this.country,
        1,
        offset,
      )
      offset = 0
    }

    const album = resp.items[offset]

    if (!album) {
      throw new Error('could not fetch album from that offset, please retry')
    } else if (album.id === this.lastPresentedID) {
      throw new Error('album is the one we last presented, please retry')
    }

    const artist = await artistPromise

    // Shuffle the genres, keeping the first one in it's place
    let genres = artist.genres

    if (genres.length > 2) {
      genres = [genres[0], ...sampleSize(genres.slice(1), genres.length - 1)]
    }

    return {
      ...album,
      artists: [artist],
      genres,
      primaryArtist: artist,
    }
  }

  getRandomAlbumByGenre = async (genre: string) => {
    // First, we must fetch a random artist in this genre
    const searchTerm = `genre:"${genre}"`
    const firstPageOfArtists = await this.search({
      value: searchTerm,
      type: ['artist'],
    })

    if (!firstPageOfArtists.artists?.total) {
      throw new Error('could not fetch first page of artists')
    }

    const artistOffsetToFetch = random(
      0,
      Math.min(firstPageOfArtists.artists.total - 1, 300),
    )

    let artist = firstPageOfArtists.artists.items[artistOffsetToFetch]

    if (!artist) {
      artist = await this.search({
        value: searchTerm,
        type: ['artist'],
        limit: 1,
        offset: artistOffsetToFetch,
      }).then((page) => {
        if (page.artists?.items?.[0]) {
          return page.artists.items[0]
        }

        throw new Error('could not fetch artist from offset')
      })
    }

    // After we fetch a random artist, fetch a random album by them
    const albums = await this.api.artists
      .albums(artist.id, 'album', this.country, 50)
      .then((page) =>
        page.items.filter(
          (album) =>
            album.album_type !== 'single' &&
            (!this.lastPresentedID || album.id !== this.lastPresentedID),
        ),
      )

    if (!albums.length) {
      throw new Error(
        'could not fetch an album for this artist from this genre',
      )
    }

    const album = sample(albums) ?? albums[0]

    return {
      ...album,
      genres: artist.genres,
      primaryArtist: artist,
    }
  }

  getRandomAlbumForRelatedArtist = async (artistName: string) => {
    // First, we have to fetch the artist to get it's ID
    const artist = await this.search({
      artist: artistName,
      type: ['artist'],
      limit: 1,
    }).then((resp) => resp.artists?.items?.[0])

    if (!artist) {
      throw new Error('could not find artist with that name')
    }

    return this.getRandomAlbumForRelatedArtistByID(artist.id)
  }

  getRandomAlbumForRelatedArtistByID = async (artistID: string) => {
    // Get the artist details to search for similar artists
    const artist = await this.api.artists.get(artistID)

    // If artist popularity is less than 40, use genre search instead
    if (artist.popularity < 40 && artist.genres.length > 0) {
      const randomGenre = sample(artist.genres)
      if (randomGenre) {
        return this.getRandomAlbumByGenre(randomGenre)
      }
    }

    let relatedArtists: any[] = []

    // Strategy 1: Search by genre first (primary approach)
    if (artist.genres.length > 0) {
      const randomGenre = sample(artist.genres)
      const genreSearchResults = await this.search({
        value: `genre:"${randomGenre}"`,
        type: ['artist'],
        limit: 50,
      })
      relatedArtists =
        genreSearchResults.artists?.items.filter((a) => a.id !== artistID) ?? []
    }

    // Strategy 2: If no genre results, try multiple genres
    if (!relatedArtists.length && artist.genres.length > 1) {
      const shuffledGenres = sampleSize(
        artist.genres,
        Math.min(3, artist.genres.length),
      )
      const multiGenreQuery = shuffledGenres
        .map((g: string) => `genre:"${g}"`)
        .join(' OR ')
      const multiGenreResults = await this.search({
        value: multiGenreQuery,
        type: ['artist'],
        limit: 50,
      })
      relatedArtists =
        multiGenreResults.artists?.items.filter((a) => a.id !== artistID) ?? []
    }

    // Strategy 3: Name-based search as last resort, with intersection filtering
    if (!relatedArtists.length) {
      const searchResults = await this.search({
        value: artist.name,
        type: ['artist'],
        limit: 50,
      })

      const nameSearchResults =
        searchResults.artists?.items.filter((a) => a.id !== artistID) ?? []
      relatedArtists = this.filterNameIntersections(
        artist.name,
        nameSearchResults,
      )
    }

    // Find a random related artist (or fall back to the original artist)
    const targetArtistID =
      relatedArtists.length > 0
        ? sample([artistID, ...relatedArtists.map((a) => a.id), artistID])
        : artistID

    if (!targetArtistID) {
      throw new Error('could not sample to find target artist')
    }

    // Finally, return a random album from the targetArtist
    return this.getRandomAlbumForArtistByID(targetArtistID)
  }

  // Helper method to filter out artists with simple name intersections
  private filterNameIntersections = (
    originalName: string,
    artists: any[],
  ): any[] => {
    const originalWords = originalName.toLowerCase().split(/\s+/)

    return artists.filter((artist) => {
      const artistWords = artist.name.toLowerCase().split(/\s+/)

      // Count meaningful word intersections (ignore common words)
      const commonWords = new Set([
        'the',
        'and',
        'or',
        'of',
        'in',
        'at',
        'to',
        'a',
        'an',
      ])
      const meaningfulOriginalWords = originalWords.filter(
        (word: string) => !commonWords.has(word) && word.length > 2,
      )
      const meaningfulArtistWords = artistWords.filter(
        (word: string) => !commonWords.has(word) && word.length > 2,
      )

      // Check for substring matches that might indicate name padding (like "MC", "DJ", etc.)
      const hasSubstringMatch = meaningfulOriginalWords.some((origWord) =>
        meaningfulArtistWords.some(
          (artistWord: string) =>
            origWord.includes(artistWord) || artistWord.includes(origWord),
        ),
      )

      // Filter out if there's too much overlap or obvious name padding
      const overlapRatio =
        meaningfulOriginalWords.length > 0
          ? meaningfulOriginalWords.filter((word) =>
              meaningfulArtistWords.some(
                (artistWord: string) =>
                  artistWord.includes(word) || word.includes(artistWord),
              ),
            ).length / meaningfulOriginalWords.length
          : 0

      // Keep artists with low overlap or no obvious substring matches
      return (
        overlapRatio < 0.5 &&
        (!hasSubstringMatch || meaningfulOriginalWords.length === 0)
      )
    })
  }

  async getRandomAlbumForLabel(label: string) {
    return this.getRandomAlbumForSearchTerm(`label:"${label}"`, 500)
  }

  async getArtistByID(artistID: string) {
    return this.api.artists.get(artistID)
  }

  async getGenreForArtist(artistID: string) {
    const artist = await this.getArtistByID(artistID)
    return artist.genres
  }

  async getAlbum(album: string, artist: string) {
    const resp = await this.search({
      album,
      artist,
      type: ['album'],
      limit: 50,
    })
    const albums = resp.albums?.items ?? []

    switch (albums.length) {
      case 0:
        throw new Error('could not locate album by searching Spotify')
      case 1: {
        const primaryArtist = await this.getArtistByID(albums[0].artists[0].id)

        return {
          ...albums[0],
          genres: primaryArtist.genres,
          primaryArtist,
        }
      }
      default: {
        const album = albums.sort((a) => (a.album_type !== 'single' ? 1 : 0))[0]
        const primaryArtist = await this.getArtistByID(album.artists[0].id)

        return {
          ...album,
          genres: primaryArtist.genres,
          primaryArtist,
        }
      }
    }
  }

  getRandomAlbumFromUserLibrary = async () => {
    if (!this.api.getAccessToken()) {
      throw new Error('User must be logged in to use this')
    }

    let resp = await this.api.currentUser.albums.savedAlbums(
      50,
      0,
      this.country,
    )
    let offset = random(0, resp.total - 1)

    if (offset > resp.items.length - 1) {
      resp = await this.api.currentUser.albums.savedAlbums(
        1,
        offset,
        this.country,
      )
      offset = 0
    }

    const album = resp.items[offset]?.album

    if (!album) {
      throw new Error('could not fetch album from that offset, please retry')
    } else if (album.id === this.lastPresentedID) {
      throw new Error('we just presented this album, please retry')
    }

    const primaryArtist = await this.getArtistByID(album.artists[0].id)

    return {
      ...album,
      genres: primaryArtist.genres,
      primaryArtist,
    }
  }

  getRandomAlbumFromUsersTopArtists = async (
    params: z.infer<typeof topArtistSearch>,
  ) => {
    if (!this.api.getAccessToken()) {
      throw new Error('User must be logged in to use this')
    }

    const artists = await this.api.currentUser.topItems(
      'artists',
      params.timeRange,
      50,
    )

    if (!artists.items.length) {
      throw new Error('could not fetch top artists')
    }

    const targetArtist = sample(artists.items) ?? artists.items[0]

    if (params.related) {
      return {
        targetArtist,
        album: await this.getRandomAlbumForRelatedArtistByID(targetArtist.id),
      }
    }

    return {
      targetArtist,
      album: await this.getRandomAlbumForArtistByID(targetArtist.id),
    }
  }

  getRandomAlbumSimilarToWhatIsCurrentlyPlaying = async () => {
    if (!this.api.getAccessToken()) {
      throw new Error('User must be logged in to use this')
    }

    const currentlyPlaying = await this.getCurrentlyPlayingTrack()
    const album = await this.getRandomAlbumForRelatedArtistByID(
      currentlyPlaying.artists[0].id,
    )

    return {
      album,
      currentlyPlaying,
    }
  }

  getCurrentlyPlayingTrack = async () => {
    if (!this.api.getAccessToken()) {
      throw new Error('User must be logged in to use this')
    }

    const playerState = await this.api.player.getPlaybackState(this.country)
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
    const resp = await this.api.browse.getNewReleases(
      this.country,
      50,
      random(0, 49),
    )
    const album = resp.albums.items[0]

    if (album.id === this.lastPresentedID) {
      throw new Error('selected album that was last presented, please retry')
    }

    const primaryArtist = await this.getArtistByID(album.artists[0].id)

    return {
      ...album,
      genres: primaryArtist.genres,
      primaryArtist,
    }
  }

  searchArists = async (term: string): Promise<SpotifyArtist[]> => {
    const results = await this.search({
      value: term,
      type: ['artist'],
    })

    return (
      results.artists?.items.map((artist) => ({
        name: artist.name,
        id: artist.id,
        image: artist.images.at(-1),
      })) ?? []
    )
  }

  getUser = async (): Promise<SpotifyUser | null> => {
    if (!this.api.getAccessToken()) {
      return null
    }

    try {
      const user = await this.api.currentUser.profile()
      return pick(user, ['id', 'display_name', 'href', 'images', 'uri'])
    } catch (e) {
      return null
    }
  }

  followArtist = async (artistIDs: string | string[]) => {
    const client = await this.getClient()
    return client.currentUser.followArtistsOrUsers(
      Array.isArray(artistIDs) ? artistIDs : [artistIDs],
      'artist',
    )
  }

  saveAlbum = async (albumID: string) => {
    return this.api.currentUser.albums.saveAlbums([albumID])
  }

  getRelatedArtists = async (artistID: string) => {
    // Get the artist details to search for similar artists
    const artist = await this.api.artists.get(artistID)

    let relatedArtists: any[] = []

    // Strategy 1: Search by genre first (primary approach)
    if (artist.genres.length > 0) {
      const randomGenre = sample(artist.genres)
      const genreSearchResults = await this.search({
        value: `genre:"${randomGenre}"`,
        type: ['artist'],
        limit: 50,
      })
      relatedArtists =
        genreSearchResults.artists?.items.filter((a) => a.id !== artistID) ?? []
    }

    // Strategy 2: If no genre results, try multiple genres
    if (!relatedArtists.length && artist.genres.length > 1) {
      const shuffledGenres = sampleSize(
        artist.genres,
        Math.min(3, artist.genres.length),
      )
      const multiGenreQuery = shuffledGenres
        .map((g: string) => `genre:"${g}"`)
        .join(' OR ')
      const multiGenreResults = await this.search({
        value: multiGenreQuery,
        type: ['artist'],
        limit: 50,
      })
      relatedArtists =
        multiGenreResults.artists?.items.filter((a) => a.id !== artistID) ?? []
    }

    // Strategy 3: Name-based search as last resort, with intersection filtering
    if (!relatedArtists.length) {
      const searchResults = await this.search({
        value: artist.name,
        type: ['artist'],
        limit: 50,
      })

      const nameSearchResults =
        searchResults.artists?.items.filter((a) => a.id !== artistID) ?? []
      relatedArtists = this.filterNameIntersections(
        artist.name,
        nameSearchResults,
      )
    }

    return relatedArtists
  }

  getUserTopArtists = async (): Promise<SpotifyArtist[]> => {
    if (!this.api.getAccessToken()) {
      throw new Error('User must be logged in to use this')
    }

    const artists = await this.api.currentUser.topItems(
      'artists',
      undefined,
      50,
    )
    return artists.items.map((artist) => ({
      name: artist.name,
      id: artist.id,
      image: artist.images.at(-1),
    }))
  }

  search = (query: {
    value?: string
    album?: string
    artist?: string
    track?: string
    year?: string | number
    upc?: string
    hipster?: boolean
    new?: string
    isrc?: string
    genre?: string
    type: ItemTypes[]
    limit?: MaxInt<50>
    offset?: number
    includeExternal?: string
  }) => {
    let q = ''

    for (const [key, value] of Object.entries(query)) {
      switch (key) {
        case 'type':
        case 'limit':
        case 'offset':
        case 'includeExternal':
          continue

        case 'value':
          q = `${value}${q ? ' ' : ''}${q}`
          break

        case 'hipster':
        case 'new':
          q += `${q ? ' ' : ''}tag:${key}`
          break

        default:
          q += `${q ? ' ' : ''}${key}:"${value}"`
      }
    }

    return this.api.search(
      q,
      query.type,
      this.country,
      query.limit,
      query.offset,
      query.includeExternal,
    )
  }
}

const cookieFactory = createCookie('spotify', {
  maxAge: 3600,
})

const initializeFromRequest = async (req: Request, ctx: AppLoadContext) => {
  blockBots(req)
  const context = getRequestContextValues(req, ctx)
  const session = await spotifyStrategy.getSession(req)
  const settings = await userSettings.get(req)
  const [currentSearchType] = userSettings.getCurrentSearchFromRequest(req)
  const { logger, serverTiming } = context
  const options: SpotifyOptions = {
    lastPresentedID: undefined,
    clientID: context.env.SPOTIFY_CLIENT_ID,
    clientSecret: context.env.SPOTIFY_CLIENT_SECRET,
    sdkOptions: {
      beforeRequest: (url, options) => {
        if (logger) {
          logger.debug('request start', {
            label: 'spotify',
            request: {
              url,
              ...omit(options, ['headers']),
            },
          })
        }

        const timingID = crypto
          .createHash('md5')
          .update(`${options.method ?? 'GET'} ${url}`)
          .digest('hex')
        serverTiming.start({
          label: `spotify.request.${timingID}`,
          desc: `${options.method ?? 'GET'} ${url}`,
        })
      },
      afterRequest: (url, options, response) => {
        if (logger) {
          const isRateLimited = response.status === 429

          logger[response.ok ? 'debug' : 'error'](
            `request ${response.ok ? 'end' : 'error'}`,
            {
              label: 'spotify',
              details: isRateLimited
                ? 'Spotify is rate limiting the application!'
                : undefined,
              request: {
                url,
                headers: options.headers,
                ...omit(options, ['headers']),
              },
              response: pick(response, ['status']),
              email: isRateLimited ? true : undefined,
            },
          )
        }

        const timingID = crypto
          .createHash('md5')
          .update(`${options.method ?? 'GET'} ${url}`)
          .digest('hex')
        serverTiming.end({
          label: `spotify.request.${timingID}`,
        })
      },
    },
  }

  if (settings.lastPresented && settings.lastSearchType === currentSearchType) {
    options.lastPresentedID = settings.lastPresented
  }

  if (session) {
    options.accessToken = {
      access_token: session.accessToken,
      refresh_token: session.refreshToken ?? '',
      expires_in: session.expiresAt - Date.now(),
      expires: session.expiresAt,
      token_type: session.tokenType ?? 'Bearer',
    }
  }

  // Netlify forwards the country based upon geoip in the x-country header
  // https://answers.netlify.com/t/user-location-in-headers/11937/3
  if (req.headers.get('x-country')) {
    // @ts-ignore
    options.country = req.headers.get('x-country') || undefined
  }

  const url = new URL(req.url)

  if (url.searchParams.get('country')) {
    // @ts-ignore
    options.country = url.searchParams.get('country') || undefined
  }

  return new Spotify(options)
}

export const topArtistSearch = zfd.formData({
  timeRange: z.enum(['short_term', 'medium_term', 'long_term']).optional(),
  related: z.coerce.boolean().default(false),
})

const api = {
  initializeFromRequest,
  cookieFactory,
}

export default api
