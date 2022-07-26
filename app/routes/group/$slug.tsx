import { useLoaderData } from '@remix-run/react'
import { json, LoaderArgs } from '@remix-run/node'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

export async function loader({ params }: LoaderArgs) {
  if (!params.slug) {
    throw new Error('slug must be provided to this route')
  }

  return json({
    album: await spotify.getRandomAlbumForGroupSlug(params.slug),
    group: params.slug,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function GroupBySlug() {
  const { album, group } = useLoaderData<typeof loader>()

  if (!album) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={<SearchBreadcrumbs crumbs={['Group', group]} />}>
      <Album album={album} />
    </Layout>
  )
}
