import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import spotify from '~/lib/spotify'
import Album from '~/components/Album'

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
    <Album
      url={data.album.external_urls.spotify}
      artist={data.album.artists?.[0].name}
      album={data.album.name}
    />
  )
}
