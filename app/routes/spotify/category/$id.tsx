import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout, Link } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import PlaylistErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ params }: LoaderArgs) {
  const categoryID = params.id

  if (!categoryID) {
    throw json(
      {
        error: 'categoryID must be set as a route parameter',
      },
      401
    )
  }

  const data = {
    playlist: await spotify.getRandomPlaylistForCategory(categoryID),
    category: await spotify.getCategory(categoryID),
  }

  return json(data)
}

export const ErrorBoundary = PlaylistErrorBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist, category } = useLoaderData<typeof loader>()

  return (
    <Layout
      headerBreadcrumbs={[
        'Spotify',
        [
          'Playlist Category',
          <Link to="/spotify/categories">Playlist Category</Link>,
        ],
        category.name,
      ]}
    >
      <Playlist playlist={playlist} />
    </Layout>
  )
}
