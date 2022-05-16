import { useLoaderData } from '@remix-run/react'
import { json, LoaderFunction } from '@remix-run/node'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumForGroupSlug>>
}

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.slug) {
    throw new Error('slug must be provided to this route')
  }

  const data: LoaderData = {
    album: await spotify.getRandomAlbumForGroupSlug(params.slug),
  }

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

export default function GroupBySlug() {
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
