import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import { Layout } from '~/components/Base'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumByGenre>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    throw new Error(`The search param 'q' must be provided`)
  }

  const data = await promiseHash({
    album: spotify.getRandomAlbumByGenre(q),
  })

  return json(data)
}

export default function GenreSearch() {
  const { album } = useLoaderData<LoaderData>()

  if (!album?.external_urls?.spotify) {
    return null
  }

  return (
    <Layout>
      <Album
        url={album.external_urls.spotify}
        artist={album.artists?.[0].name}
        album={album.name}
      />
    </Layout>
  )
}