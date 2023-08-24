import { LoaderFunction, json } from '@remix-run/node'

import spotifyLib from '~/lib/spotify.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const artists = await spotify.getUserTopArtists()

  return json(artists)
}
