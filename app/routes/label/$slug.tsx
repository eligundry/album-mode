import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumForLabelSlug>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  const data: LoaderData = await promiseHash({
    album: spotify.getRandomAlbumForLabelSlug(slug),
  })

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

export default function LabelBySlug() {
  const { album } = useLoaderData<LoaderData>()

  if (!album?.external_urls?.spotify) {
    return null
  }

  return (
    <Layout>
      <Album album={album} />
    </Layout>
  )
}
