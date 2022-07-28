import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')

  if (!genre) {
    throw json(
      { error: 'genre query param must be provided to search via genre' },
      400
    )
  }

  const spotify = await spotifyLib.initializeFromRequest(request)

  return json({
    album: await spotify.getRandomAlbumByGenre(genre),
    genre,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function GenreSearch() {
  const data = useLoaderData<typeof loader>()

  const { album, genre } = data

  if (!album?.external_urls?.spotify) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={['Genre', genre]}>
      <Album album={album} />
    </Layout>
  )
}
