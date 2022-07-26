import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

type LoaderData = {
  playlist: Awaited<ReturnType<typeof spotify.getRandomFeaturedPlaylist>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    playlist: await spotify.getRandomFeaturedPlaylist(),
  }

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Playlist playlist={playlist} />
    </Layout>
  )
}
