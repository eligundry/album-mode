import { useLoaderData } from '@remix-run/react'
import { json, LoaderArgs } from '@remix-run/node'

import spotifyLib from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

export async function loader({ params, request }: LoaderArgs) {
  if (!params.slug) {
    throw new Error('slug must be provided to this route')
  }

  const spotify = await spotifyLib.initializeFromRequest(request)

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
    <Layout headerBreadcrumbs={['Group', group]}>
      <Album album={album} />
    </Layout>
  )
}
