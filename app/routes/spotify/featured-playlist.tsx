import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import ServerTiming from '~/lib/serverTiming.server'

export async function loader({ request }: LoaderArgs) {
  const headers = new Headers()
  const serverTiming = new ServerTiming()
  const spotify = await serverTiming.time('spotify-init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const playlist = await serverTiming.time('spotify-fetch', () =>
    spotify.getRandomFeaturedPlaylist()
  )
  headers.set('Set-Cookie', await lastPresented.set(request, playlist.id))
  headers.set(serverTiming.headerKey, serverTiming.header())

  return json({ playlist }, { headers })
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'Featured Playlist']}>
      <Playlist playlist={playlist} />
    </Layout>
  )
}
