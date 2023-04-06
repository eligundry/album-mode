import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import config from '~/config'

export async function loader({
  request,
  context: { serverTiming },
}: LoaderArgs) {
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const album = await retry(async (_, attempt) => {
    const album = await serverTiming.track('spotify.fetch', () =>
      spotify.getRandomNewRelease()
    )
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
    })
  )

  return json(
    {
      album,
      wiki,
    },
    {
      headers: {
        'set-cookie': await userSettings.setLastPresented({
          request,
          lastPresented: album.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary
export const headers = forwardServerTimingHeaders
export const meta: MetaFunction<typeof loader> = () => ({
  title: `New Releases | ${config.siteTitle}`,
  description: 'Listen to a random album that just came out!',
})

export default function SpotifyNewReleases() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Spotify', 'New Releases']}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
