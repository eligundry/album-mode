import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import { Layout, Typography, A, Container } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'

type LoaderData =
  | ({
      slug: string
    } & Awaited<ReturnType<typeof spotify.getRandomAlbumForPublication>>)
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
    const data: LoaderData = {
      slug: 'bandcamp-daily',
      album: await db.getRandomBandcampDailyAlbum(),
      review: undefined,
    }

    return json(data)
  }

  const { album, review } = await spotify.getRandomAlbumForPublication(slug)

  const data: LoaderData = {
    slug,
    review,
    album,
  }

  return json(data)
}

export const ErrorBoundary = AlbumErrorBoundary

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

  let footer = null

  if (slug?.includes('p4k')) {
    const url = new URL('https://pitchfork.com' + review.slug)
    url.searchParams.set('utm_campaign', 'album-mode.party')

    footer = (
      <Typography className={clsx('my-4')}>
        Need convincing? Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
        .
      </Typography>
    )
  } else if (slug === 'needle-drop') {
    footer = (
      <Typography className={clsx('my-4')}>
        Need convincing? Watch the{' '}
        <A href={review.slug} target="_blank">
          Needle Drop review on YouTube
        </A>
        .
      </Typography>
    )
  }

  return (
    <Layout>
      <Container>
        <Album
          album={album.name}
          albumURL={album.external_urls.spotify}
          artist={album.artists?.[0].name}
          artistURL={album.artists?.[0].external_urls.spotify}
          footer={footer}
        />
      </Container>
    </Layout>
  )
}
