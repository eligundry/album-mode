import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import auth from '~/lib/auth.server'
import spotifyLib from '~/lib/spotify.server'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ request }: LoaderArgs) {
  const cookie = await auth.getCookie(request)

  if (!('accessToken' in cookie.spotify)) {
    throw json(
      { error: 'You must be logged in via Spotify to access this' },
      401
    )
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const { album, currentlyPlaying } =
    await spotify.getRandomAlbumSimilarToWhatIsCurrentlyPlaying()
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json(
    {
      album,
      currentlyPlaying,
      wiki,
    },
    {
      headers: {
        'Set-Cookie': await auth.cookieFactory.serialize(cookie),
      },
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary

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
