import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'

import lastPresented from '~/lib/lastPresented.server'
import { badRequest, serverError } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'

import PlaylistErrorBoundary, {
  AlbumCatchBoundary as PlaylistCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { Layout, Link } from '~/components/Base'
import config from '~/config'

export async function loader({
  params,
  request,
  context: { serverTiming, logger },
}: LoaderArgs) {
  const categoryID = params.id?.trim()

  if (!categoryID) {
    throw badRequest({
      error: 'categoryID must be set as a route parameter',
      logger,
    })
  }

  const headers = new Headers()
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const { category, playlist } = await promiseHash({
    category: serverTiming.track('spotify.fetch-category', () =>
      spotify.getCategory(categoryID)
    ),
    playlist: serverTiming.track('spotify.fetch-playlist', () =>
      spotify.getRandomPlaylistForCategory(categoryID)
    ),
  })

  if (!category) {
    throw serverError({ error: 'could not pull category', logger })
  }

  headers.set('Set-Cookie', await lastPresented.set(request, playlist.id))
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json({ playlist, category }, { headers })
}

export const ErrorBoundary = PlaylistErrorBoundary
export const CatchBoundary = PlaylistCatchBoundary
export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: `${data.category.name} | ${config.siteTitle}`,
  description: `${config.siteDescription} Listen to a ${data.category.name} playlist on Spotify!`,
})

export default function RandomSpotifyFeaturedPlaylist() {
  const { playlist, category } = useLoaderData<typeof loader>()

  return (
    <Layout
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
