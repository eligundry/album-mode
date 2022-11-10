import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import ServerTiming from '@eligundry/server-timing'

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
  const headers = new Headers()
  const slug = params.slug?.trim()
  const lastPresentedID = await lastPresented.getLastPresentedID(request)
  const serverTiming = new ServerTiming()

  if (!slug) {
    throw json({ error: 'slug must be provided in the URL' }, 400)
  }

  if (slug === 'bandcamp-daily') {
    const album = await serverTiming.track('db', () =>
      db.getRandomBandcampDailyAlbum({
        exceptID: lastPresentedID ?? undefined,
      })
    )
    const wiki = await serverTiming.track('wikipedia', () =>
      wikipedia.getSummaryForAlbum({
        album: album.album,
        artist: album.artist,
      })
    )
    headers.set(
      'Set-Cookie',
      await lastPresented.set(request, album.albumID.toString())
    )
    headers.set(serverTiming.headerKey, serverTiming.toString())

    return json(
      {
        slug: 'bandcamp-daily',
        album,
        wiki,
        type: 'bandcamp' as const,
      },
      { headers }
    )
  }

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )

  const { album, review } = await retry(
    async (_, attempt) => {
      const review = await serverTiming.track(`db`, () =>
        db.getRandomAlbumForPublication({
          publicationSlug: slug,
          exceptID: lastPresentedID,
        })
      )
      const album = await serverTiming.track(`spotify.fetch`, () =>
        spotify.getAlbum(review.album, review.artist)
      )
      serverTiming.add({
        label: 'attempts',
        desc: `${attempt} Attempt(s)`,
      })

      return { album, review }
    },
    {
      retries: 5,
      factor: 0,
      minTimeout: 0,
      randomize: false,
    }
  )
  const wiki = await serverTiming.track('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  )
  headers.set(
    'Set-Cookie',
    await lastPresented.set(request, review.id.toString())
  )
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json(
    {
      slug,
      review,
      album,
      wiki,
      type: 'spotify' as const,
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

  if ('review' in data && data.review.slug.startsWith('http')) {
    const url = new URL(data.review.slug)
    url.searchParams.set('utm_campaign', 'publication')

    if (data.slug.includes('p4k')) {
      footer = (
        <Heading level="h5">
          Read the{' '}
          <A href={url.toString()} target="_blank">
            Pitchfork Review
          </A>
        </Heading>
      )
    } else if (data.slug === 'needle-drop') {
      footer = (
        <Heading level="h5">
          Watch the{' '}
          <A href={url.toString()} target="_blank">
            Needle Drop review on YouTube
          </A>
        </Heading>
      )
    } else if (data.slug === '33-13-sound') {
      footer = (
        <Heading level="h5">
          <A href={url.toString()} target="_blank">
            Buy the {data.review.publicationName} book on this album
          </A>
        </Heading>
      )
    }
  }

  if (data.review.publicationURL) {
    const publicationURL = new URL(data.review.publicationURL)
    publicationURL.searchParams.set('utm_source', 'album-mode.party')
    publicationURL.searchParams.set('utm_campaign', 'publication')
    publicationURL.searchParams.set('utm_term', data.review.publicationSlug)

    breadcrumbs.push([
      data.review.publicationName,
      <A href={publicationURL.toString()} target="_blank" key="publication-url">
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
