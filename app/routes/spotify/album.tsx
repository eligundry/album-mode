import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import auth from '~/lib/auth'
import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'

type LoaderData =
  | {
      album: Awaited<ReturnType<typeof spotify.getRandomAlbumFromUserLibrary>>
    }
  | {
      error: string
    }

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = await auth.getCookie(request)

  if (!('accessToken' in cookie.spotify)) {
    return json(
      { error: 'You must be logged in via Spotify to access this' },
      401
    )
  }

  const data: LoaderData = {
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
  const data = useLoaderData<LoaderData>()

  if ('error' in data) {
    return null
  }

  return (
    <Layout>
      <Album album={data.album} />
    </Layout>
  )
}
