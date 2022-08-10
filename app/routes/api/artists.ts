import { LoaderFunction, json } from '@remix-run/node'

import spotifyLib from '~/lib/spotify.server'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const artist = url.searchParams.get('artist')
  const spotify = await spotifyLib.initializeFromRequest(request)
  const artists = await (artist
    ? spotify.searchArists(artist)
    : spotify.getTopArtists())
  const cacheLifetime = 60 * 60 * 24

  return json(artists, {
    headers: {
      'Cache-Control': `public, max-age=${cacheLifetime}, s-maxage=${cacheLifetime}`,
    },
  })
}
