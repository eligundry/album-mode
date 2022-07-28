import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import spotifyLib from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    throw json(
      { error: 'q search paramter must be provided to search labels' },
      400
    )
  }

  return json({
    album: await spotify.getRandomAlbumForLabel(q),
    label: q,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function LabelSearch() {
  const data = useLoaderData<typeof loader>()

  const { album } = data

  if (!album) {
    return null
  }

  return (
    <Layout headerBreadcrumbs={['Labels', data.label]}>
      <Album album={album} />
    </Layout>
  )
}
