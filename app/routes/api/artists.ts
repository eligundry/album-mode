import { LoaderFunction, json } from '@remix-run/node'

import spotifyLib from '~/lib/spotify.server'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const artist = url.searchParams.get('artist')

  if (!artist) {
    throw json(
      { error: 'artist must be provided in the query parameters' },
      400
    )
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const artists = await spotify.searchArists(artist)

  return json(artists)
}
