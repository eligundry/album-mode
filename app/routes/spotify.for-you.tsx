import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { spotifyStrategy } from '~/lib/auth.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'

import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

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
  const playlist = await retry(async (_, attempt) => {
    const album = await spotify.getRandomForYouPlaylist()
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
    },
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ matches }) =>
  mergeMeta(matches, [
    { title: `For You | ${config.siteTitle}` },
    {
      name: 'description',
      content: 'Listen to a random that Spotify has generated just for you!',
    },
  ])

export default function RandomAlbumFromSpotifyLibrary() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout hideFooter headerBreadcrumbs={['Spotify', 'For You']}>
      <Playlist playlist={data.playlist} />
    </Layout>
  )
}
