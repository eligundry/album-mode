import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ params, request }: LoaderArgs) {
  if (!params.slug) {
    throw json({ error: 'slug must be provided to this route' }, 400)
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
export const CatchBoundary = AlbumCatchBoundary

export default function GroupBySlug() {
  const { album, group, wiki } = useLoaderData<typeof loader>()

  if (!album) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={['Group', group]}>
      <Album album={album} footer={<WikipediaSummary summary={wiki} />} />
    </Layout>
  )
}
