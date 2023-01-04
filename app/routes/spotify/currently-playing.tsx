import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import auth from '~/lib/auth.server'
import lastPresented from '~/lib/lastPresented.server'
import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import config from '~/config'

export async function loader({ request, context }: LoaderArgs) {
  const cookie = await auth.getCookie(request)
  const { serverTiming } = context

  if (!('accessToken' in cookie.spotify)) {
    throw json(
      { error: 'You must be logged in via Spotify to access this' },
      401
    )
  }

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const { album, currentlyPlaying } = await retry(async (_, attempt) => {
    const album = await serverTiming.track('spotify.fetch', () =>
      spotify.getRandomAlbumSimilarToWhatIsCurrentlyPlaying()
    )
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return album
  }, config.asyncRetryConfig)
  const wiki = await serverTiming.track('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  )
  const headers = new Headers()
  headers.append('Set-Cookie', await auth.cookieFactory.serialize(cookie))
  headers.append('Set-Cookie', await lastPresented.set(request, album.id))
  headers.append(serverTiming.headerKey, serverTiming.toString())

  return json(
    {
      album,
      currentlyPlaying,
      wiki,
    },
    { headers }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

export default function PlayMeSomethingLikeWhatsCurrentlyPlaying() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout
      headerBreadcrumbs={['Artist', data.currentlyPlaying.artists[0].name]}
    >
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
