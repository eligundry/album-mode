import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import { Layout, A } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import SearchBreadcrumbs, {
  SearchBreadcrumbsProps,
} from '~/components/SearchBreadcrumbs'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'publication',
})

export async function loader({ params }: LoaderArgs) {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  if (slug === 'bandcamp-daily') {
    return json({
      slug: 'bandcamp-daily',
      album: await db.getRandomBandcampDailyAlbum(),
      type: 'bandcamp',
    })
  }

  const { album, review } = await spotify.getRandomAlbumForPublication(slug)

  return json({
    slug,
    review,
    album,
    type: 'spotify',
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function PublicationBySlug() {
  const data = useLoaderData<typeof loader>()

  if (!data.album) {
    return null
  }

  if (data.type === 'bandcamp') {
    return (
      <Layout>
        <SearchBreadcrumbs
          crumbs={[
            'Publication',
            [
              'Bandcamp Daily',
              <A href={`https://daily.bandcamp.com/${searchParams.toString()}`}>
                Bandcamp Daily
              </A>,
            ],
          ]}
        />
        <BandcampAlbum album={data.album} />
      </Layout>
    )
  }

  let footer = null
  let breadcrumbs: SearchBreadcrumbsProps['crumbs'] = ['Publication']

  if (data.slug.includes('p4k') && 'review' in data) {
    const url = new URL(
      `https://pitchfork.com${data.review.slug}?${searchParams.toString()}`
    )

    footer = (
      <>
        Need convincing? Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
        .
      </>
    )
    breadcrumbs.push([
      data.review.publicationName,
      <A
        href={`https://pitchfork.com?${searchParams.toString()}`}
        target="_blank"
      >
        {data.review.publicationName}
      </A>,
    ])
  } else if (data.slug === 'needle-drop' && 'review' in data) {
    footer = (
      <>
        Need convincing? Watch the{' '}
        <A href={data.review.slug} target="_blank">
          Needle Drop review on YouTube
        </A>
        .
      </>
    )
    breadcrumbs.push([
      data.review.publicationName,
      <A
        href={`https://www.theneedledrop.com/?${searchParams.toString()}`}
        target="_blank"
      >
        {data.review.publicationName}
      </A>,
    ])
  } else {
    breadcrumbs.push(data.review.publicationName)
  }

  return (
    <Layout
      headerBreadcrumbs={
        <SearchBreadcrumbs
          crumbs={breadcrumbs}
          blurb={data.review.publicationBlurb}
        />
      }
    >
      <Album album={data.album} footer={footer} />
    </Layout>
  )
}
