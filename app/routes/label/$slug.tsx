import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import SpotifyEmbed from 'react-spotify-embed'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'

type LoaderData = {
  album: Awaited<ReturnType<typeof spotify.getRandomAlbumForLabelSlug>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  const data: LoaderData = await promiseHash({
    album: spotify.getRandomAlbumForLabelSlug(slug),
  })

  return json(data)
}

export default function LabelBySlug() {
  const data = useLoaderData<LoaderData>()

  if (!data.album?.external_urls?.spotify) {
    return null
  }

  return (
    <>
      <SpotifyEmbed link={data.album.external_urls.spotify} />
    </>
  )
}
