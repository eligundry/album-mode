import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const album = await spotify.getRandomNewRelease()
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json({
    album,
    wiki,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function SpotifyNewReleases() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'New Releases']}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
