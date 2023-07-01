import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { badRequest, forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { A, Heading, Layout } from '~/components/Base'
import { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import config from '~/config'
import useUTM from '~/hooks/useUTM'

export async function loader({ params, request, context }: LoaderArgs) {
  const { serverTiming, logger, database } = context
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
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context)
  )

  const data = await retry(async (_, attempt) => {
    const review = await serverTiming.track(`db`, () =>
      database.getRandomReviewedItem({
        reviewerSlug: slug,
        exceptID: lastPresented,
      })
    )

    if (review.service === 'bandcamp') {
      const wiki = await serverTiming.track('wikipedia', () =>
        wikipedia.getSummaryForAlbum({
          album: review.album,
          artist: review.artist,
        })
      )

      return { review, album: null, wiki, type: 'bandcamp' as const }
    }

    const album = await serverTiming.track(`spotify.fetch`, () =>
      spotify.getAlbum(review.album, review.artist)
    )
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    const wiki = await serverTiming.track('wikipedia', () =>
      wikipedia.getSummaryForAlbum({
        album: album.name,
        artist: album.artists[0].name,
      })
    )

    return { album, review, wiki, type: 'spotify' as const }
  }, config.asyncRetryConfig)

  headers.set(
    'Set-Cookie',
    await userSettings.setLastPresented({
      request,
      lastPresented: data.review.id.toString(),
    })
  )
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json({ slug, ...data }, { headers })
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ data, matches }) => {
  if (!data) {
    return []
  }

  let description = config.siteDescription
  let title = config.siteTitle

  title = `${data.review.publicationName} | ${config.siteTitle}`
  description = `${config.siteDescription} You simply must listen to this album that was highly rated by ${data.review.publicationName}!`

  if (data.review.publicationMetadata?.metaDescription) {
    description = `${config.siteDescription} ${data.review.publicationMetadata?.metaDescription}`
  }

  return mergeMeta(matches, [
    { title },
    {
      name: 'description',
      content: description,
    },
  ])
}

export default function PublicationBySlug() {
  const data = useLoaderData<typeof loader>()
  const { createExternalURL } = useUTM()
  let footer = null
  let breadcrumbs: SearchBreadcrumbsProps['crumbs'] = ['Publication']

  if ('review' in data && data.review.reviewURL.startsWith('http')) {
    const url = createExternalURL(data.review.reviewURL)

    if (data.slug.includes('p4k')) {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
          Read the{' '}
          <A href={url.toString()} target="_blank">
            Pitchfork Review
          </A>
        </Heading>
      )
    } else if (data.slug === 'needle-drop') {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
          Watch the{' '}
          <A href={url.toString()} target="_blank">
            Needle Drop review on YouTube
          </A>
        </Heading>
      )
    } else if (data.slug === '33-13-sound') {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
          Buy the{' '}
          <A href={url.toString()} target="_blank">
            {data.review.publicationName} book
          </A>{' '}
          about this album
        </Heading>
      )
    } else if (data.slug === 'robert-christgau') {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
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
      data.review.reviewURL.startsWith('https://')
    ) {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
          Read the{' '}
          <A href={url.toString()} target="_blank">
            Resident Advisor Review
          </A>
        </Heading>
      )
    } else if (
      data.slug === 'bandcamp-daily' &&
      data.review.reviewURL.startsWith('https://')
    ) {
      footer = (
        <Heading level="h5" noSpacing className="my-2">
          Read the{' '}
          <A href={url.toString()} target="_blank">
            Bandcamp Daily review
          </A>
        </Heading>
      )
    }
  }

  if (data.review.publicationMetadata?.url) {
    const publicationURL = createExternalURL(
      data.review.publicationMetadata.url
    )

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
    <Layout headerBreadcrumbs={breadcrumbs} hideFooter>
      {data.type === 'spotify' && (
        <Album album={data.album} wiki={data.wiki} footer={footer} />
      )}
      {data.type === 'bandcamp' && data.review.reviewMetadata?.bandcamp && (
        <BandcampAlbum
          album={{
            album: data.review.album,
            albumID: data.review.reviewMetadata.bandcamp.albumID,
            artist: data.review.artist,
            imageURL: data.review.reviewMetadata.imageURL ?? null,
            url: data.review.reviewMetadata.bandcamp.url,
          }}
          wiki={data.wiki}
          footer={footer}
        />
      )}
    </Layout>
  )
}
