import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db.server'
import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout, A, Heading } from '~/components/Base'
import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ params, request }: LoaderArgs) {
  const slug = params.slug?.trim()
  const headers = new Headers()
  const lastPresentedID = await lastPresented.getLastPresentedID(request)

  if (!slug) {
    throw json({ error: 'slug must be provided in the URL' }, 400)
  }

  if (slug === 'bandcamp-daily') {
    const album = await db.getRandomBandcampDailyAlbum({
      exceptID: lastPresentedID ?? undefined,
    })
    const wiki = await wikipedia.getSummaryForAlbum({
      album: album.album,
      artist: album.artist,
    })
    headers.set(
      'Set-Cookie',
      await lastPresented.set(request, album.albumID.toString())
    )

    return json(
      {
        slug: 'bandcamp-daily',
        album,
        wiki,
        type: 'bandcamp',
      },
      { headers }
    )
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  const { album, review } = await spotify.getRandomAlbumForPublication(slug)
  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })
  headers.set(
    'Set-Cookie',
    await lastPresented.set(request, review.id.toString())
  )

  return json(
    {
      slug,
      review,
      album,
      wiki,
      type: 'spotify',
    },
    { headers }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

export default function PublicationBySlug() {
  const data = useLoaderData<typeof loader>()

  if (data.type === 'bandcamp') {
    const searchParams = new URLSearchParams({
      utm_source: 'album-mode.party',
      utm_campaign: 'publication',
      utm_term: 'bandcamp-daily',
    })

    return (
      <Layout
        headerBreadcrumbs={[
          'Publication',
          [
            'Bandcamp Daily',
            <A
              key="publication-url"
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
    const url = new URL(data.review.slug)
    url.searchParams.set('utm_campaign', 'publication')

    footer = (
      <Heading level="h5">
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
      </Heading>
    )
    breadcrumbs.push([
      data.review.publicationName,
      <A
        href={`https://pitchfork.com?${url.searchParams.toString()}`}
        target="_blank"
        key="publication-url"
      >
        {data.review.publicationName}
      </A>,
    ])
  } else if (data.slug === 'needle-drop' && 'review' in data) {
    const url = new URL(data.review.slug)
    url.searchParams.set('utm_campaign', 'publication')

    footer = (
      <Heading level="h5">
        Watch the{' '}
        <A href={url.toString()} target="_blank">
          Needle Drop review on YouTube
        </A>
      </Heading>
    )
    breadcrumbs.push([
      data.review.publicationName,
      <A
        href={`https://www.theneedledrop.com/?${url.searchParams.toString()}`}
        target="_blank"
        key="publication-url"
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
