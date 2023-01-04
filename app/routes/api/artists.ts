import { LoaderFunction, json } from '@remix-run/node'

import spotifyLib from '~/lib/spotify.server'

import config from '~/config'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const artist = url.searchParams.get('artist')
  const spotify = await spotifyLib.initializeFromRequest(request)
  const artists = await (artist
    ? spotify.searchArists(artist)
    : spotify.getTopArtists())

  return json(artists, {
    headers: {
      'Cache-Control': config.cacheControl.public,
    },
  })
}
