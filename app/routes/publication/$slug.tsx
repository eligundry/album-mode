import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import { Layout, Typography, A, Container } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'

type LoaderData =
  | {
      slug: string
      review: Awaited<ReturnType<typeof db.getRandomAlbumForPublication>>
      album: Awaited<ReturnType<typeof spotify.getAlbum>>
    }
  | {
      slug: 'bandcamp-daily'
      review?: undefined
      album: Awaited<ReturnType<typeof db.getRandomBandcampDailyAlbum>>
    }

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  if (slug === 'bandcamp-daily') {
    const data: LoaderData = await promiseHash({
      slug: 'bandcamp-daily',
      album: db.getRandomBandcampDailyAlbum(),
      review: undefined,
    })

    return json(data)
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

  if (!album) {
    return null
  }

  if (slug === 'bandcamp-daily' && !review) {
    return (
      <Layout>
        <Container>
          <BandcampAlbum
            albumID={album.albumID}
            album={album.album}
            artist={album.artist}
            url={album.bandcampDailyURL}
            footer={
              <Typography className={clsx('my-4')}>
                Need convincing? Read the{' '}
                <A href={album.bandcampDailyURL} target="_blank">
                  Bandcamp Daily review
                </A>
                .
              </Typography>
            }
          />
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        <Album
          url={album.external_urls.spotify}
          artist={album.artists?.[0].name}
          album={album.name}
          footer={
            slug?.includes('p4k') && (
              <Typography className={clsx('my-4')}>
                Need convincing? Read the{' '}
                <A
                  href={'https://pitchfork.com' + review?.slug}
                  target="_blank"
                >
                  Pitchfork Review
                </A>
                .
              </Typography>
            )
          }
        />
      </Container>
    </Layout>
  )
}
