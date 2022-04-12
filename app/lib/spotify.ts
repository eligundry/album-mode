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

  const client = await getClient()
  const resp = await client.search(`label:"${label.name}"`, ['album'], {
    limit: 50,
  })

  return sample(resp.body.albums?.items)
}

const api = { getRandomAlbumForLabelSlug }

export default api
