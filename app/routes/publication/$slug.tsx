import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import db from '~/lib/db.server'
import { badRequest } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { A, Heading, Layout } from '~/components/Base'
import { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import WikipediaSummary from '~/components/WikipediaSummary'
import config from '~/config'
import useUTM from '~/hooks/useUTM'

export async function loader({
  params,
  request,
  context: { serverTiming, logger },
}: LoaderArgs) {
  const headers = new Headers()
  const slug = params.slug?.trim()
  const settings = await userSettings.get(request)
  const lastPresented =
    settings.lastSearchType === 'publication' && settings.lastPresented
      ? settings.lastPresented
      : undefined

  if (!slug) {
    throw badRequest({ error: 'slug must be provided in the URL', logger })
  }

  if (slug === 'bandcamp-daily') {
    const album = await serverTiming.track('db', () =>
      db.getRandomBandcampDailyAlbum({
        exceptID: lastPresented ?? undefined,
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
      await userSettings.setLastPresented({
        request,
        lastPresented: album.albumID.toString(),
      })
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

  const { album, review } = await retry(async (_, attempt) => {
    const review = await serverTiming.track(`db`, () =>
      db.getRandomAlbumForPublication({
        publicationSlug: slug,
        exceptID: lastPresented,
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
  }, config.asyncRetryConfig)
  const wiki = await serverTiming.track('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  )
  headers.set(
    'Set-Cookie',
    await userSettings.setLastPresented({
      request,
      lastPresented: review.id.toString(),
    })
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
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {}
  }

  let description = config.siteDescription
  let title = config.siteTitle

  if (data.type === 'bandcamp') {
    title = `Bandcamp | ${config.siteTitle}`
    description = `${config.siteDescription} Listen to something good according to Bandcamp's staff`
  }

  if (data.type === 'spotify') {
    title = `${data.review.publicationName} | ${config.siteTitle}`
    description = `${config.siteDescription} You simply must listen to this album that was highly rated by ${data.review.publicationName}!`

    if (data.review.publicationMetaDescription) {
      description = `${config.siteDescription} ${data.review.publicationMetaDescription}`
    }
  }

  return {
    title,
    description,
  }
}

export default function PublicationBySlug() {
  const data = useLoaderData<typeof loader>()
  const { createExternalURL } = useUTM()

  if (data.type === 'bandcamp') {
    return (
      <Layout
        headerBreadcrumbs={[
          'Publication',
          [
            'Bandcamp Daily',
            <A
              key="publication-url"
              href={createExternalURL('https://daily.bandcamp.com/').toString()}
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
                  href={createExternalURL(
                    data.album.bandcampDailyURL
                  ).toString()}
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
    const url = createExternalURL(data.review.slug)

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
          Buy the{' '}
          <A href={url.toString()} target="_blank">
            {data.review.publicationName} book
          </A>{' '}
          about this album
        </Heading>
      )
    } else if (data.slug === 'robert-christgau') {
      footer = (
        <Heading level="h5">
          {url.pathname.includes('get_album.php') ? (
            <>
              Read{' '}
              <A href={url.toString()} target="_blank">
                {data.review.publicationName}'s Consumer Guide™️{' '}
              </A>{' '}
              for this album
            </>
          ) : (
            <>
              Read{' '}
              <A href={url.toString()} target="_blank">
                {data.review.publicationName}'s musings
              </A>{' '}
              about this artist
            </>
          )}
        </Heading>
      )
    } else if (
      data.slug === 'resident-advisor' &&
      data.review.slug.startsWith('https://')
    ) {
      footer = (
        <Heading level="h5">
          Read the{' '}
          <A href={url.toString()} target="_blank">
            Pitchfork Review
          </A>
        </Heading>
      )
    }
  }

  if (data.review.publicationURL) {
    const publicationURL = createExternalURL(data.review.publicationURL)

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
