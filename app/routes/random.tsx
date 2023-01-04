import { LoaderArgs, redirect } from '@remix-run/node'

import random from '~/lib/random.server'
import spotifyLib from '~/lib/spotify.server'

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const route = await random.getAction(spotify)
  return redirect(route)
}
