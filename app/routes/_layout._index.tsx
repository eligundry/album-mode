import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { getRequestContextValues } from '~/lib/context.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import { Container } from '~/components/Base'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import config from '~/config'

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

  return json(data, { headers })
}

export const ErrorBoundary = PageErrorBoundary

export default function Index() {
  const data = useLoaderData<typeof loader>()

  return (
    <Container>
      <h1>TBD</h1>
    </Container>
  )
}
