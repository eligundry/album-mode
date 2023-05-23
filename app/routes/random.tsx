import { LoaderArgs, redirect } from '@remix-run/node'
import sample from 'lodash/sample'

import spotifyLib from '~/lib/spotify.server'

const options = ['artist', 'genre', 'publication'] as const

export async function loader({ request, context: { database } }: LoaderArgs) {
  const option = sample<(typeof options)[number]>(options)

  switch (option) {
    case 'publication':
      return redirect(
        `/publication/${await database.getRandomPublication()}?from=play-me-something`
      )

    case 'genre':
      return redirect(
        `/genre/${await database.getRandomGenre(50)}?from=play-me-something`
      )

    case 'artist':
      const spotify = await spotifyLib.initializeFromRequest(request)
      const artist = await spotify.getRandomTopArtist()
      return redirect(`/spotify/artist-id/${artist.id}?from=play-me-something`)

    default:
      throw new Error(`unsupported option ${option}`)
  }
}
