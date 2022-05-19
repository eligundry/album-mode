import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumFromUserLibrary>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await spotify.cookieFactory.parse(cookieHeader)

  if (!cookie.accessToken) {
    return json(
      { error: 'You must be logged in via Spotify to access this' },
      403
    )
  }

  const data: LoaderData = {
    album: await spotify.getRandomAlbumFromUserLibrary(cookie.accessToken),
  }

  return json(data)
}

export default function RandomAlbumFromSpotifyLibrary() {
  const { album } = useLoaderData<LoaderData>()
  console.log(album)

  if (!album) {
    return null
  }

  return (
    <Layout>
      <Album
        album={album.name}
        albumURL={album.external_urls.spotify}
        artist={album.artists?.[0].name}
        artistURL={album.artists?.[0].external_urls.spotify}
      />
    </Layout>
  )
}
