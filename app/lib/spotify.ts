import util from 'util'
import SpotifyWebApi from 'spotify-web-api-node'
import { createCookie } from '@remix-run/node'
import sample from 'lodash/sample'
import random from 'lodash/random'
import db from './db'

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

const getClient = async () => {
  // @TODO This token expires, I need to cache it with a TTL
  if (!spotifyAPI.getAccessToken()) {
    await spotifyAPI
      .clientCredentialsGrant()
      .then((data) => spotifyAPI.setAccessToken(data.body.access_token))
  }

  return spotifyAPI
}

const getUserClient = (accessToken: string, refreshToken?: string) => {
  const api = spotifyAPIFactory()
  api.setAccessToken(accessToken)

  if (refreshToken) {
    api.setRefreshToken(refreshToken)
  }

  return api
}

const getRandomAlbumForLabelSlug = async (labelSlug: string) => {
  const label = await db.getLabelBySlug(labelSlug)

  if (!label) {
    throw new Error(`Could not find label for slug '${labelSlug}'`)
  }

  return getRandomAlbumForLabel(label.name)
}

const getRandomAlbumForGroupSlug = async (groupSlug: string) => {
  const artist = await db.getRandomArtistFromGroupSlug(groupSlug)

  if (!artist) {
    throw new Error(`Could not find artist under group slug '${groupSlug}'`)
  }

  return getRandomAlbumForSearchTerm(`artist:"${artist.name}"`)
}

const getRandomAlbumForLabel = async (label: string) =>
  getRandomAlbumForSearchTerm(`label:"${label}"`, 500)

const getRandomAlbumForArtist = async (artistName: string) => {
  const client = await getClient()
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
  const offset = random(0, firstPage.body.total)

  if (offset === 0) {
    return firstPage.body.items[0]
  }

  return client
    .getArtistAlbums(artist.id, {
      limit: 1,
      offset,
      include_groups: 'album',
    })
    .then((resp) => resp.body.items[0])
}

const getRandomAlbumForSearchTerm = async (
  searchTerm: string,
  poolLimit = 1000
): Promise<SpotifyApi.AlbumObjectSimplified | null> => {
  const client = await getClient()
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

  return client
    .search(searchTerm, ['album'], {
      limit: 1,
      offset: albumOffsetToFetch,
    })
    .then((resp) => {
      if (!resp.body.albums?.items?.[0]) {
        console.error(
          util.inspect(resp, false, 100000, true),
          albumOffsetToFetch
        )
        throw new Error(
          `could not fetch album for search term from offset (Spotify status code: ${resp.statusCode})`
        )
      }

      const album = resp.body.albums.items[0]

      if (album.album_type === 'single') {
        return getRandomAlbumForSearchTerm(searchTerm, poolLimit)
      }

      return album
    })
}

const getRandomAlbumForPublication = async (
  publicationSlug: string
): Promise<{
  review: Awaited<ReturnType<typeof db.getRandomAlbumForPublication>>
  album: Awaited<ReturnType<typeof getAlbum>>
}> => {
  const review = await db.getRandomAlbumForPublication(publicationSlug)
  const album = await getAlbum(review.album, review.aritst)

  if (!album) {
    return getRandomAlbumForPublication(publicationSlug)
  }

  return { review, album }
}

const getRandomAlbumByGenre = async (
  genre: string
): Promise<SpotifyApi.AlbumObjectSimplified | null> => {
  // First, we must fetch a random artist in this genre
  const limit = 1
  const searchTerm = `genre:"${genre}"`
  const client = await getClient()
  const firstPageOfArtists = await client.search(searchTerm, ['artist'], {
    limit,
  })

  if (!firstPageOfArtists.body.artists?.total) {
    throw new Error('could not fetch first page of artists')
  }

  const artistOffsetToFetch = random(
    0,
    Math.min(firstPageOfArtists.body.artists.total, 300)
  )

  let artistID = firstPageOfArtists.body.artists.items[0].id

  if (artistOffsetToFetch > 0) {
    const artist = await client
      .search(searchTerm, ['artist'], {
        limit: 1,
        offset: artistOffsetToFetch,
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
    return getRandomAlbumByGenre(genre)
  }

  return sample(albums) ?? null
}

const getRandomAlbumForRelatedArtist = async (artistName: string) => {
  const client = await getClient()
  // First, we have to fetch the artist to get it's ID
  const artist = await client
    .search(`artist:"${artistName}"`, ['artist'], {
      limit: 1,
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
  return getRandomAlbumForSearchTerm(`artist:"${targetArtist.name}"`)
}

const getAlbum = async (album: string, artist: string) =>
  (await getClient())
    .search(`album:"${album}" artist:"${artist}"`, ['album'], {
      limit: 50,
    })
    .then((resp) => resp.body.albums?.items ?? [])
    .then((albums) => albums.filter((album) => album.album_type !== 'single'))
    .then((albums) => albums?.[0])

const getRandomAlbumFromUserLibrary = async (accessToken: string) => {
  const client = getUserClient(accessToken)
  const firstPage = await client.getMySavedAlbums({
    limit: 1,
  })

  const targetOffset = random(0, firstPage.body.total)

  if (targetOffset === 0) {
    return firstPage.body.items[0].album
  }

  return client
    .getMySavedAlbums({
      offset: targetOffset,
      limit: 1,
    })
    .then((resp) => resp.body.items[0].album)
}

const getRandomNewRelease = async (country: string = 'US') => {
  const client = await getClient()
  const resp = await client.getNewReleases({
    country,
    limit: 50,
    offset: random(0, 50),
  })

  return resp.body.albums.items[0]
}

const getRandomFeaturedPlaylist = async (country = 'US') => {
  const client = await getClient()
  let resp = await client.getFeaturedPlaylists({
    country,
    limit: 1,
    offset: random(0, 50),
  })

  if (resp.body.playlists.items.length === 0) {
    resp = await client.getFeaturedPlaylists({
      country,
      limit: 1,
      offset: random(0, resp.body.playlists.total),
    })
  }

  return resp.body.playlists.items[0]
}

const getCategories = async (country = 'US') => {
  const client = await getClient()
  const resp = await client.getCategories({
    country,
    limit: 50,
  })

  return resp.body.categories.items
}

const getRandomPlaylistForCategory = async (
  categoryID: string,
  country = 'US'
) => {
  const client = await getClient()
  const resp = await client.getPlaylistsForCategory(categoryID, {
    country,
    limit: 1,
    offset: random(0, 50),
  })

  return resp.body.playlists.items[0]
}

const cookieFactory = createCookie('spotify', {
  maxAge: 3600,
})

const api = {
  cookieFactory,
  getAlbum,
  getCategories,
  getRandomAlbumByGenre,
  getRandomAlbumForArtist,
  getRandomAlbumForGroupSlug,
  getRandomAlbumForLabel,
  getRandomAlbumForLabelSlug,
  getRandomAlbumForPublication,
  getRandomAlbumForRelatedArtist,
  getRandomAlbumForSearchTerm,
  getRandomAlbumFromUserLibrary,
  getRandomFeaturedPlaylist,
  getRandomNewRelease,
  getRandomPlaylistForCategory,
  getUserClient,
}

export default api
