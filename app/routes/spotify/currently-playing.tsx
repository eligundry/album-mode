import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import auth from '~/lib/auth'
import spotifyLib from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  const cookie = await auth.getCookie(request)

  if (!('accessToken' in cookie.spotify)) {
    throw json(
      { error: 'You must be logged in via Spotify to access this' },
      401
    )
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const data = await spotify.getRandomAlbumSimilarToWhatIsCurrentlyPlaying()

  return json(data, {
    headers: {
      'Set-Cookie': await auth.cookieFactory.serialize(cookie),
    },
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function PlayMeSomethingLikeWhatsCurrentlyPlaying() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout
      headerBreadcrumbs={['Artist', data.currentlyPlaying.artists[0].name]}
    >
      <Album album={data.album} />
    </Layout>
  )
}
