import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import PlaylistErrorBoundary from '~/components/Album/ErrorBoundary'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

export async function loader({ params }: LoaderArgs) {
  const categoryID = params.id

  if (!categoryID) {
    throw new Error('the categoryID must be provided to this route')
  }

  const data = {
    playlist: await spotify.getRandomPlaylistForCategory(categoryID),
    categoryID,
  }

  return json(data)
}

export const ErrorBoundary = PlaylistErrorBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist, categoryID } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <SearchBreadcrumbs parts={['Spotify', 'Playlist Category', categoryID]} />
      <Playlist playlist={playlist} />
    </Layout>
  )
}
