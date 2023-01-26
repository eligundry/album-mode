import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { badRequest } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ request, context: { logger } }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const url = new URL(request.url)
  const label = url.searchParams.get('label')

  if (!label) {
    throw badRequest({
      error: 'label search paramter must be provided to search labels',
      logger,
    })
  }

  const album = await spotify.getRandomAlbumForLabel(label)
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json({
    album,
    wiki,
    label,
  })
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

export default function LabelSearch() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Labels', data.label]}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
