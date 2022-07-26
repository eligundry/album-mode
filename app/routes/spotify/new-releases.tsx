import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const country = url.searchParams.get('country') || undefined

  return json({
    album: await spotify.getRandomNewRelease(country),
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function SpotifyNewReleases() {
  const { album } = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'New Releases']}>
      <Album album={album} />
    </Layout>
  )
}
