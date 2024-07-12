import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getRequestContextValues } from '~/lib/context.server'
import { badRequest } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { logger } = getRequestContextValues(request, context)
  const label = params.slug

  if (!label) {
    throw badRequest({ error: 'slug must be provided in URL', logger })
  }

  const spotify = await spotifyLib.initializeFromRequest(request, context)
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

export default function LabelBySlug() {
  const data = useLoaderData<typeof loader>()

  return <Album album={data.album} wiki={data.wiki} />
}
