import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { spotifyStrategy } from '~/lib/auth.server'
import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'

import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming } = context
  await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request, {
      failureRedirect: config.requiredLoginFailureRedirect,
    })
  )

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const playlist = await retry(async (_, attempt) => {
    const album = await serverTiming.track('spotify.fetch', () =>
      spotify.getRandomForYouPlaylist()
    )
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return album
  }, config.asyncRetryConfig)

  return json(
    { playlist },
    {
      headers: {
        'set-cookie': await userSettings.setLastPresented({
          request,
          lastPresented: playlist.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary
export const headers = forwardServerTimingHeaders
export const meta: MetaFunction<typeof loader> = () => ({
  title: `For You | ${config.siteTitle}`,
  description: 'Listen to a random that Spotify has generated just for you!',
})

export default function RandomAlbumFromSpotifyLibrary() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'For You']}>
      <Playlist playlist={data.playlist} />
    </Layout>
  )
}
