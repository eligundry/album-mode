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

export async function loader({
  params,
  request,
  context: { logger },
}: LoaderArgs) {
  const label = params.slug

  if (!label) {
    throw badRequest({ error: 'slug must be provided in URL', logger })
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
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

export default function LabelBySlug() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Labels', data.label]}>
      <Album album={data.album} wiki={data.wiki} />
    </Layout>
  )
}
