import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import startCase from 'lodash/startCase'

import { getRequestContextValues } from '~/lib/context.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { badRequest, forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import config from '~/config'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { serverTiming, logger } = getRequestContextValues(request, context)
  const genre = params.genre

  if (!genre) {
    throw badRequest({
      error: 'genre param must be provided to search via genre',
      logger,
    })
  }

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )
  const album = await retry(async (_, attempt) => {
    const album = await spotify.getRandomAlbumByGenre(genre)
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return album
  }, config.asyncRetryConfig)
  const wiki = await serverTiming.track('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    }),
  )

  return json(
    {
      album,
      genre,
      wiki,
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

  const genre = startCase(data.genre)

  return mergeMeta(matches, [
    { title: `${genre} | ${config.siteTitle}` },
    {
      name: 'description',
      content: `Discover new music from the ${genre} genre on Spotify!`,
    },
  ])
}

export default function GenreSearch() {
  const data = useLoaderData<typeof loader>()

  const { album, genre } = data

  if (!album?.external_urls?.spotify) {
    return null
  }

  return (
    <Layout hideFooter headerBreadcrumbs={['Genre', genre]}>
      <Album album={album} wiki={data.wiki} />
    </Layout>
  )
}
