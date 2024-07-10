import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import { promiseHash } from 'remix-utils/promise'

import { getRequestContextValues } from '~/lib/context.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import {
  badRequest,
  forwardServerTimingHeaders,
  serverError,
} from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { serverTiming, logger, env } = getRequestContextValues(
    request,
    context,
  )
  const artistID = params.artistID
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )

  if (!artistID) {
    throw badRequest({
      error: 'artistID must be provided as route param',
      logger,
    })
  }

  const { album, artist } = await retry(async (_, attempt) => {
    const resp = await promiseHash({
      album: spotify.getRandomAlbumForRelatedArtistByID(artistID),
      artist: spotify.getArtistByID(artistID),
    })
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return resp
  }, config.asyncRetryConfig)

  const wiki = await serverTiming.track('wikipedia', () => {
    if (!album) {
      throw serverError({
        error: 'could not fetch album',
        logger,
        headers: serverTiming.headers(),
      })
    }

    return wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  })

  return json(
    {
      album,
      artist,
      wiki,
      OG_API_URL: env.OG_API_URL,
    },
    {
      headers: {
        'Set-Cookie': await userSettings.setLastPresented({
          request,
          lastPresented: album.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    },
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ data, matches }) => {
  if (!data) {
    return []
  }

  const title = `Discover music similar to ${data.artist.name}`
  const description = `We think that you might like ${data.album.artists[0].name}`
  const ogImage = `${data.OG_API_URL}/api/artist/${data.artist.id}`

  return mergeMeta(matches, [
    { title: `${title} | ${config.siteTitle}` },
    { name: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:image', content: ogImage },
  ])
}

export default function RelatedArtistSearch() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Artist', data.artist.name ?? '']} hideFooter>
      <Album album={data.album} wiki={data.wiki} />
    </Layout>
  )
}
