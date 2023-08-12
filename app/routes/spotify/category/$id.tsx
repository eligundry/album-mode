import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { promiseHash } from 'remix-utils'

import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import {
  badRequest,
  forwardServerTimingHeaders,
  serverError,
} from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'

import PlaylistErrorBoundary from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout, Link } from '~/components/Base'
import config from '~/config'

export async function loader({ params, request, context }: LoaderArgs) {
  const { serverTiming, logger } = context
  const categoryID = params.id?.trim()

  if (!categoryID) {
    throw badRequest({
      error: 'categoryID must be set as a route parameter',
      logger,
    })
  }

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )
  const { category, playlist } = await promiseHash({
    category: serverTiming.track('spotify.fetch-category', () =>
      spotify.getCategory(categoryID),
    ),
    playlist: serverTiming.track('spotify.fetch-playlist', () =>
      spotify.getRandomPlaylistForCategory(categoryID),
    ),
  })

  if (!category) {
    throw serverError({ error: 'could not pull category', logger })
  }

  return json(
    { playlist, category },
    {
      headers: {
        'set-cookie': await userSettings.setLastPresented({
          request,
          lastPresented: playlist.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    },
  )
}

export const ErrorBoundary = PlaylistErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ data, matches }) => {
  if (!data) {
    return mergeMeta(matches, [])
  }

  return mergeMeta(matches, [
    { title: `${data.category.name} | ${config.siteTitle}` },
    {
      name: 'description',
      content: `${config.siteDescription} Listen to a ${data.category.name} playlist on Spotify!`,
    },
  ])
}

export default function RandomSpotifyCategoryPlaylist() {
  const { playlist, category } = useLoaderData<typeof loader>()

  return (
    <Layout
      hideFooter
      headerBreadcrumbs={[
        'Spotify',
        [
          'Playlist Category',
          <Link to="/spotify/categories" key="link">
            Playlist Category
          </Link>,
        ],
        category.name,
      ]}
    >
      <Playlist playlist={playlist} />
    </Layout>
  )
}
