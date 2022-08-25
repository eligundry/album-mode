import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout, Link } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'
import PlaylistErrorBoundary, {
  AlbumCatchBoundary as PlaylistCatchBoundary,
} from '~/components/Album/ErrorBoundary'

export async function loader({ params, request }: LoaderArgs) {
  const categoryID = params.id?.trim()

  if (!categoryID) {
    throw json({ error: 'categoryID must be set as a route parameter' }, 400)
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const category = await spotify.getCategory(categoryID)
  const playlist = await spotify.getRandomPlaylistForCategory(categoryID)

  if (!category) {
    throw json({ error: 'could not pull category' }, 500)
  }

  return json(
    { playlist, category },
    {
      headers: {
        'Set-Cookie': await lastPresented.set(request, playlist.id),
      },
    }
  )
}

export const ErrorBoundary = PlaylistErrorBoundary
export const CatchBoundary = PlaylistCatchBoundary

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist, category } = useLoaderData<typeof loader>()

  return (
    <Layout
      headerBreadcrumbs={[
        'Spotify',
        [
          'Playlist Category',
          <Link to="/spotify/categories" key="link">
            Playlist Category
          </Link>,
        ],
        category.name,
      ]}
    >
      <Playlist playlist={playlist} />
    </Layout>
  )
}
