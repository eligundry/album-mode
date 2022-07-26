import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import auth from '~/lib/auth'
import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

export async function loader({ request }: LoaderArgs) {
  const cookie = await auth.getCookie(request)

  if (!('accessToken' in cookie.spotify)) {
    return json(
      { error: 'You must be logged in via Spotify to access this' },
      401
    )
  }

  const data = {
    album: await spotify.getRandomAlbumFromUserLibrary(
      cookie.spotify.accessToken
    ),
  }

  return json(data, {
    headers: {
      'Set-Cookie': await auth.cookieFactory.serialize(cookie),
    },
  })
}

export default function RandomAlbumFromSpotifyLibrary() {
  const data = useLoaderData<typeof loader>()

  if ('error' in data) {
    return null
  }

  return (
    <Layout
      headerBreadcrumbs={<SearchBreadcrumbs crumbs={['Spotify', 'Library']} />}
    >
      <Album album={data.album} />
    </Layout>
  )
}
