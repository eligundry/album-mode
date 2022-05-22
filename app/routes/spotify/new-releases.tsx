import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomNewRelease>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const country = url.searchParams.get('country') || undefined
  const data: LoaderData = {
    album: await spotify.getRandomNewRelease(country),
  }

  return json(data)
}

export default function SpotifyNewReleases() {
  const { album } = useLoaderData<LoaderData>()

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
