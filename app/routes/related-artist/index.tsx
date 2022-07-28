import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotifyLib from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({ error: 'q query param must be provided' }, 400)
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  let searchMethod = spotify.getRandomAlbumForRelatedArtist

  // If the search term is quoted, get random album for just that artist
  if (q.startsWith('"') && q.endsWith('"')) {
    searchMethod = spotify.getRandomAlbumForArtist
  }

  const data = await promiseHash({
    album: searchMethod(q),
    artist: q,
  })

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

export default function RelatedArtistSearch() {
  const data = useLoaderData<typeof loader>()

  if (!('album' in data) || !data.album) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={['Artist', data.artist]}>
      <Album album={data.album} />
    </Layout>
  )
}
