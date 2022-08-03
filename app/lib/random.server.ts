import sample from 'lodash/sample'

import db from '~/lib/db.server'
import { Spotify } from '~/lib/spotify.server'

const options = ['artist', 'genre', 'publication'] as const

const getAction = async (spotifyClient: Spotify): Promise<string> => {
  const option = sample<typeof options[number]>(options)

  switch (option) {
    case 'publication':
      return `/publication/${await db.getRandomPublication()}`

    case 'genre':
      return `/genre?genre=${await db.getRandomTopGenre()}`

    case 'artist':
      const artist = await spotifyClient.getRandomTopArtist()
      return `/related-artist?artistID=${artist.id}`

    default:
      throw new Error(`unsupported option ${option}`)
  }
}

const api = { getAction }

export default api
