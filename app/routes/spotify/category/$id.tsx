import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Playlist from '~/components/Album/Playlist'

type LoaderData = {
  playlist: Awaited<ReturnType<typeof spotify.getRandomPlaylistForCategory>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const categoryID = params.id

  if (!categoryID) {
    throw new Error('the categoryID must be provided to this route')
  }

  const data: LoaderData = {
    playlist: await spotify.getRandomPlaylistForCategory(categoryID),
  }

  return json(data)
}

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Playlist
        playlistURL={playlist.external_urls.spotify}
        name={playlist.name}
        description={playlist.description}
      />
    </Layout>
  )
}
