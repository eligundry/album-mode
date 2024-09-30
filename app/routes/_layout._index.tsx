import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { getRequestContextValues } from '~/lib/context.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import ReviewLink from '~/components/Album/ReviewLink'
import { A, Container, Heading } from '~/components/Base'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import config from '~/config'
import useUTM from '~/hooks/useUTM'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { serverTiming, logger, database } = getRequestContextValues(
    request,
    context,
  )
  const headers = new Headers()
  const settings = await userSettings.get(request)
  const lastPresented =
    settings.lastSearchType === 'publication' && settings.lastPresented
      ? settings.lastPresented
      : undefined

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )

  const data = await retry(async (_, attempt) => {
    const review = await serverTiming.track(`db`, () =>
      database.getRandomHighQualityRecommendation({
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

      return {
        review,
        album: null,
        wiki,
        type: 'bandcamp' as const,
        slug: review.publicationSlug,
      }
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

    return {
      album,
      review,
      wiki,
      type: 'spotify' as const,
      slug: review.publicationSlug,
    }
  }, config.asyncRetryConfig)

  headers.set(
    'Set-Cookie',
    await userSettings.setLastPresented({
      request,
      lastPresented: data.review.id.toString(),
    }),
  )
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json(data, { headers })
}

export const ErrorBoundary = PageErrorBoundary

export default function Index() {
  const data = useLoaderData<typeof loader>()

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
