import SpotifyWebApi from 'spotify-web-api-node'
import sample from 'lodash/sample'
import random from 'lodash/random'
import db from './db'

const spotifyAPI = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

const getClient = async () => {
  // @TODO This token expires, I need to cache it with a TTL
  if (!spotifyAPI.getAccessToken()) {
    await spotifyAPI
      .clientCredentialsGrant()
      .then((data) => spotifyAPI.setAccessToken(data.body.access_token))
  }

  return spotifyAPI
}

const getRandomAlbumForLabelSlug = async (labelSlug: string) => {
  const label = await db.getLabelBySlug(labelSlug)

  if (!label) {
    throw new Error(`Could not find label for slug '${labelSlug}'`)
  }

  return getRandomAlbumForLabel(label.name)
}

const getRandomAlbumForLabel = async (label: string) => {
  const searchTerm = `label:"${label}"`
  const client = await getClient()
  const firstPage = await client.search(searchTerm, ['album'], {
    limit: 1,
  })

  if (!firstPage.body.albums?.total) {
    throw new Error('could not fetch first page of albums for label')
  }

  const albumOffsetToFetch = random(
    0,
    Math.min(firstPage.body.albums.total, 1000)
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
        throw new Error('could not fetch album for label from offset')
      }

      return resp.body.albums.items[0]
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
    Math.min(firstPageOfArtists.body.artists.total, 1000)
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
    .then((page) => page.body.items)

  if (!albums.length) {
    return getRandomAlbumByGenre(genre)
  }

  return sample(albums) ?? null
}

const getAlbum = async (album: string, artist: string) =>
  (await getClient())
    .search(`album:"${album}" artist:"${artist}"`, ['album'], {
      limit: 50,
    })
    .then((resp) => resp.body.albums?.items ?? [])
    .then((albums) => albums.filter((album) => album.album_type !== 'single'))
    .then((albums) => albums?.[0])

const api = {
  getRandomAlbumForLabelSlug,
  getRandomAlbumForLabel,
  getAlbum,
  getRandomAlbumForPublication,
  getRandomAlbumByGenre,
}

export default api
