import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import { Layout, A } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

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

  if (slug === 'bandcamp-daily' && !review && 'albumID' in album) {
    return (
      <Layout>
        <BandcampAlbum album={album} />
      </Layout>
    )
  }

  let footer = null

  if (slug?.includes('p4k')) {
    const url = new URL('https://pitchfork.com' + review.slug)
    url.searchParams.set('utm_campaign', 'album-mode.party')

    footer = (
      <>
        Need convincing? Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
        .
      </>
    )
  } else if (slug === 'needle-drop') {
    footer = (
      <>
        Need convincing? Watch the{' '}
        <A href={review.slug} target="_blank">
          Needle Drop review on YouTube
        </A>
        .
      </>
    )
  }

  return (
    <Layout>
      <SearchBreadcrumbs
        parts={['Publications', review.publicationName]}
        blurb={review.publicationBlurb}
      />
      <Album album={album} footer={footer} />
    </Layout>
  )
}
