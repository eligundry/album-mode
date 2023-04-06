import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'

import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({
  request,
  context: { serverTiming },
}: LoaderArgs) {
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const playlist = await serverTiming.track('spotify.fetch', () =>
    spotify.getRandomFeaturedPlaylist()
  )

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
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary
export const headers = forwardServerTimingHeaders
export const meta: MetaFunction<typeof loader> = () => ({
  title: `Featured Playlist | ${config.siteTitle}`,
  description:
    'Listen to a random playlist that Spotify recommends based upon the time of day.',
})

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'Featured Playlist']}>
      <Playlist playlist={playlist} />
    </Layout>
  )
}
