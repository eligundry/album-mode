import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db.server'
import spotifyLib from '~/lib/spotify.server'
import { Layout, A, Heading } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'publication',
})

export async function loader({ params, request }: LoaderArgs) {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  if (slug === 'bandcamp-daily') {
    const album = await db.getRandomBandcampDailyAlbum()
    const wiki = await wikipedia.getSummaryForAlbum({
      album: album.album,
      artist: album.artist,
    })

    return json({
      slug: 'bandcamp-daily',
      album,
      wiki,
      type: 'bandcamp',
    })
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const { album, review } = await spotify.getRandomAlbumForPublication(slug)
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json({
    slug,
    review,
    album,
    wiki,
    type: 'spotify',
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function PublicationBySlug() {
  const data = useLoaderData<typeof loader>()

  if (data.type === 'bandcamp') {
    return (
      <Layout
        headerBreadcrumbs={[
          'Publication',
          [
            'Bandcamp Daily',
            <A
              href={`https://daily.bandcamp.com/${searchParams.toString()}`}
              target="_blank"
            >
              Bandcamp Daily
            </A>,
          ],
        ]}
      >
        <BandcampAlbum
          album={data.album}
          footer={
            <>
              <Heading level="h5">
                Read the{' '}
                <A
                  href={`${
                    data.album.bandcampDailyURL
                  }?${searchParams.toString()}`}
                  target="_blank"
                >
                  Bandcamp Daily review
                </A>
                .
              </Heading>
              <WikipediaSummary summary={data.wiki} />
            </>
          }
        />
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
      <Heading level="h5">
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
        .
      </Heading>
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
      <Heading level="h5">
        Watch the{' '}
        <A href={data.review.slug} target="_blank">
          Needle Drop review on YouTube
        </A>
        .
      </Heading>
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
    <Layout headerBreadcrumbs={breadcrumbs}>
      <Album
        album={data.album}
        footer={
          <>
            {footer}
            <WikipediaSummary summary={data.wiki} />
          </>
        }
      />
    </Layout>
  )
}
