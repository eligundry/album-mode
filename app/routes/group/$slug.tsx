import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { badRequest } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

export async function loader({
  params,
  request,
  context: { logger },
}: LoaderArgs) {
  if (!params.slug) {
    throw badRequest({ error: 'slug must be provided to this route', logger })
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const album = await spotify.getRandomAlbumForGroupSlug(params.slug)
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json({
    album,
    wiki,
    group: params.slug,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function GroupBySlug() {
  const { album, group, wiki } = useLoaderData<typeof loader>()

  if (!album) {
    return null
  }

  return (
    <Layout hideFooter headerBreadcrumbs={['Group', group]}>
      <Album album={album} wiki={wiki} />
    </Layout>
  )
}
