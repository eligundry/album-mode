import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getRequestContextValues } from '~/lib/context.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'

import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { serverTiming } = getRequestContextValues(request, context)
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )
  const playlist = await spotify.getRandomFeaturedPlaylist()

  return json(
    { playlist },
    {
      headers: {
        [serverTiming.headerKey]: serverTiming.toString(),
        'Set-Cookie': await userSettings.setLastPresented({
          request,
          lastPresented: playlist.id,
        }),
      },
    },
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ matches }) =>
  mergeMeta(matches, [
    { title: `Featured Playlist | ${config.siteTitle}` },
    {
      name: 'description',
      content:
        'Listen to a random playlist that Spotify recommends based upon the time of day.',
    },
  ])

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<typeof loader>()

  return (
    <Layout hideFooter headerBreadcrumbs={['Spotify', 'Featured Playlist']}>
      <Playlist playlist={playlist} />
    </Layout>
  )
}
