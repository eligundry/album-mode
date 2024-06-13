import { LoaderFunction, json } from '@remix-run/node'

import { getRequestContextValues } from '~/lib/context.server'
import spotifyLib from '~/lib/spotify.server'

import config from '~/config'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { serverTiming } = getRequestContextValues(request, context)
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const artists = await spotify.getUserTopArtists()

  return json(artists, {
    headers: {
      'cache-control': config.cacheControl.private,
      [serverTiming.headerKey]: serverTiming.toString(),
    },
  })
}
