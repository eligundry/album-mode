import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import { zfd } from 'zod-form-data'

import { getRequestContextValues } from '~/lib/context.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { badRequest, forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import ReviewLink from '~/components/Album/ReviewLink'
import { A, Heading } from '~/components/Base'
import { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import config from '~/config'
import useUTM from '~/hooks/useUTM'

const queryParamsSchema = zfd.formData({
  min_score: zfd
    .numeric()
    .transform((v) => (v < 50 ? v * 10 : v))
    .optional(),
  max_score: zfd
    .numeric()
    .transform((v) => (v < 50 ? v * 10 : v))
    .optional(),
  list: zfd.text().optional(),
})

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { serverTiming, logger, database } = getRequestContextValues(
    request,
    context,
  )
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

  const queryParamsParse = queryParamsSchema.safeParse(
    new URL(request.url).searchParams,
  )

  if (!queryParamsParse.success) {
    throw badRequest({
      error: 'invalid query parameters',
      logger,
      issues: queryParamsParse.error.issues,
    })
  }

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )

  const data = await retry(async (_, attempt) => {
    const review = await serverTiming.track(`db`, () =>
      database.getRandomReviewedItem({
        reviewerSlug: slug,
        list: queryParamsParse.data.list,
        minScore: queryParamsParse.data.min_score,
        maxScore: queryParamsParse.data.max_score,
        exceptID: lastPresented,
      }),
    )

    if (review.service === 'bandcamp') {
      const wiki = await serverTiming.track('wikipedia', () =>
        wikipedia.getSummaryForAlbum({
          album: review.album,
          artist: review.artist,
        }),
      )

      return { review, album: null, wiki, type: 'bandcamp' as const }
    }

    const album = await spotify.getAlbum(review.album, review.artist)
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    const wiki = await serverTiming.track('wikipedia', () =>
      wikipedia.getSummaryForAlbum({
        album: album.name,
        artist: album.artists[0].name,
      }),
    )

    return { album, review, wiki, type: 'spotify' as const }
  }, config.asyncRetryConfig)

  headers.set(
    'Set-Cookie',
    await userSettings.setLastPresented({
      request,
      lastPresented: data.review.id.toString(),
    }),
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
  let breadcrumbs: SearchBreadcrumbsProps['crumbs'] = ['Publication']

  if (data.review.publicationMetadata?.url) {
    const publicationURL = createExternalURL(
      data.review.publicationMetadata.url,
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
    <>
      {data.type === 'spotify' && (
        <Album
          album={data.album}
          wiki={data.wiki}
          footer={
            <ReviewLink
              publicationSlug={data.review.publicationSlug}
              publicationName={data.review.publicationName}
              reviewURL={data.review.reviewURL}
              className="my-2"
            />
          }
        />
      )}
      {data.type === 'bandcamp' && data.review.reviewMetadata?.bandcamp && (
        <BandcampAlbum
          album={{
            album: data.review.album,
            albumID: data.review.reviewMetadata.bandcamp.albumID,
            artist: data.review.artist,
            imageURL: data.review.reviewMetadata.bandcamp.imageURL ?? null,
            url: data.review.reviewMetadata.bandcamp.url,
          }}
          wiki={data.wiki}
          footer={
            <ReviewLink
              publicationSlug={data.review.publicationSlug}
              publicationName={data.review.publicationName}
              reviewURL={data.review.reviewURL}
              className="my-2"
            />
          }
        />
      )}
    </>
  )
}