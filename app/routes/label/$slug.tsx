import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

export async function loader({ params }: LoaderArgs) {
  const label = params.slug

  if (!label) {
    throw new Error('slug must be provided in URL')
  }

  return json({
    album: await spotify.getRandomAlbumForLabelSlug(label),
    label,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function LabelBySlug() {
  const { album, label } = useLoaderData<typeof loader>()

  if (!album) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={['Labels', label]}>
      <Album album={album} />
    </Layout>
  )
}
