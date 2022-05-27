import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumForRelatedArtist>>
}

export const loader: LoaderFunction = async ({ request }) => {
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

  const data: LoaderData = await promiseHash({
    album: searchMethod(q),
  })

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

export default function RelatedArtistSearch() {
  const { album } = useLoaderData<LoaderData>()

  if (!album) {
    return null
  }

  return (
    <Layout>
      <Album
        album={album.name}
        albumURL={album.external_urls.spotify}
        artist={album.artists?.[0].name}
        artistURL={album.artists?.[0].external_urls.spotify}
      />
    </Layout>
  )
}
