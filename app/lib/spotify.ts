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

const getRandomAlbumForGroupSlug = async (groupSlug: string) => {
  const artist = await db.getRandomArtistFromGroupSlug(groupSlug)

  if (!artist) {
    throw new Error(`Could not find artist under group slug '${groupSlug}'`)
  }

  console.log(artist)

  return getRandomAlbumForSearchTerm(`artist:"${artist.name}"`)
}

const getRandomAlbumForLabel = async (label: string) =>
  getRandomAlbumForSearchTerm(`label:"${label}"`, 500)

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
    Math.min(firstPage.body.albums.total, poolLimit)
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
        throw new Error('could not fetch album for search term from offset')
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

const api = {
  getRandomAlbumForLabelSlug,
  getRandomAlbumForLabel,
  getAlbum,
  getRandomAlbumForPublication,
  getRandomAlbumByGenre,
  getRandomAlbumForGroupSlug,
  getRandomAlbumForSearchTerm,
  getRandomAlbumForRelatedArtist,
}

export default api
