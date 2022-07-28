import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader() {
  return json({
    playlist: await spotify.getRandomFeaturedPlaylist(),
  })
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
