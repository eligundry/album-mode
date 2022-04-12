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

// @TODO It would be cool to paginate this so we have the full list
const getRandomAlbumForLabel = async (label: string) =>
  (await getClient())
    .search(`label:"${label}"`, ['album'], {
      limit: 50,
    })
    .then(
      (resp) =>
        resp.body.albums?.items.filter(
          (album) => album.album_type !== 'single'
        ) ?? []
    )
    .then((albums) => sample(albums))

const getAlbum = async (album: string, artist: string) =>
  (await getClient())
    .search(`${album} ${artist}`, ['album'], {
      limit: 50,
    })
    .then((resp) => resp.body.albums?.items ?? [])
    .then((albums) => albums.filter((album) => album.album_type !== 'single'))
    .then((albums) => albums?.[0])

const api = { getRandomAlbumForLabelSlug, getRandomAlbumForLabel, getAlbum }

export default api
