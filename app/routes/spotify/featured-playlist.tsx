import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import lastPresented from '~/lib/lastPresented.server'
import spotifyLib from '~/lib/spotify.server'

import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({ request, context }: LoaderArgs) {
  const headers = new Headers()
  const { serverTiming } = context
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const playlist = await serverTiming.track('spotify.fetch', () =>
    spotify.getRandomFeaturedPlaylist()
  )
  headers.set('Set-Cookie', await lastPresented.set(request, playlist.id))
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json({ playlist }, { headers })
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary
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
