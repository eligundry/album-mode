import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'
import ServerTiming from '~/lib/serverTiming.server'

export async function loader({ request }: LoaderArgs) {
  const headers = new Headers()
  const serverTiming = new ServerTiming()
  const spotify = await serverTiming.time('spotify-init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const album = await serverTiming.time('spotify-fetch', () =>
    spotify.getRandomNewRelease()
  )
  const wiki = await serverTiming.time('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  )
  headers.set('Set-Cookie', await lastPresented.set(request, album.id))
  headers.set(serverTiming.headerKey, serverTiming.header())

  return json(
    {
      album,
      wiki,
    },
    { headers }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

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
