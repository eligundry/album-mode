import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const playlist = await spotify.getRandomFeaturedPlaylist()

  return json(
    { playlist },
    {
      headers: {
        'Set-Cookie': await lastPresented.set(request, playlist.id),
      },
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'Featured Playlist']}>
      <Playlist playlist={playlist} />
    </Layout>
  )
}
