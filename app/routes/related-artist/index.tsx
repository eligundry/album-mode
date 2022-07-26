import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({ error: 'q query param must be provided' }, 400)
  }

  let searchMethod = spotify.getRandomAlbumForRelatedArtist

  // If the search term is quoted, get random album for just that artist
  if (q.startsWith('"') && q.endsWith('"')) {
    searchMethod = spotify.getRandomAlbumForArtist
  }

  const data = await promiseHash({
    album: searchMethod(q),
    q,
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
    <Layout>
      <SearchBreadcrumbs crumbs={['Artist', data.q]} />
      <Album album={data.album} />
    </Layout>
  )
}
