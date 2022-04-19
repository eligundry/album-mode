import SpotifyWebApi from 'spotify-web-api-node'
import sample from 'lodash/sample'
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
  const limit = 50
  const searchTerm = `label:"${label}"`
  const client = await getClient()
  const firstPage = await client.search(searchTerm, ['album'], {
    limit,
  })

  if (!firstPage.body.albums) {
    return null
  }

  const numberToFetch = Math.min(firstPage.body.albums.total, 250)
  const pages = Math.ceil(numberToFetch / limit)
  const albums = [
    ...firstPage.body.albums.items,
    ...(
      await Promise.all(
        [...Array(pages).keys()]
          .map((page) => page + 2)
          .flatMap((page) =>
            client
              .search(searchTerm, ['album'], {
                limit,
                offset: limit * page,
              })
              .then((resp) => resp.body.albums?.items)
          )
      )
    ).flat(),
  ].filter((album) => album && album.album_type !== 'single')

  return sample(albums)
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

const getAlbum = async (album: string, artist: string) =>
  (await getClient())
    .search(`${album} ${artist}`, ['album'], {
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
}

export default api
