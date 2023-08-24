import { LoaderArgs, redirect } from '@remix-run/node'
import retry from 'async-retry'

import { spotifyStrategy } from '~/lib/auth.server'
import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'

import config from '~/config'

export const headers = forwardServerTimingHeaders

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming } = context
  await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request, {
      failureRedirect: config.requiredLoginFailureRedirect,
    }),
  )

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )
  const currentlyPlaying = await retry(async (_, attempt) => {
    const album = spotify.getCurrentlyPlayingTrack()
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return album
  }, config.asyncRetryConfig)

  return redirect(
    `/related-artist?artistID=${currentlyPlaying.artists[0].id}`,
    {
      headers: {
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    },
  )
}
