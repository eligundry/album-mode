import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import { Layout, Typography, A } from '~/components/Base'
import Album from '~/components/Album'

type LoaderData = {
  slug: string
  review: Awaited<ReturnType<typeof db.getRandomAlbumForPublication>>
  album: Awaited<ReturnType<typeof spotify.getAlbum>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  const review = await db.getRandomAlbumForPublication(slug)

  const data: LoaderData = await promiseHash({
    slug,
    review,
    album: spotify.getAlbum(review?.album, review?.aritst),
  })

  return json(data)
}

export default function PublicationBySlug() {
  const { album, slug, review } = useLoaderData<LoaderData>()
  console.log({ slug, review })

  return (
    <Layout>
      <Album
        url={album.external_urls.spotify}
        artist={album.artists?.[0].name}
        album={album.name}
        footer={
          slug?.includes('p4k') && (
            <Typography className={clsx('my-4')}>
              If you want to learn more,{' '}
              <A href={'https://pitchfork.com' + review?.slug} target="_blank">
                here's the Pitchfork Review
              </A>
              .
            </Typography>
          )
        }
      />
    </Layout>
  )
}
