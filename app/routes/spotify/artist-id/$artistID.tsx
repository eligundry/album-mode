import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import promiseHash from 'promise-hash'
import { badRequest, serverError } from 'remix-utils'

import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import config from '~/config'
import env from '~/env.server'

export async function loader({
  request,
  params,
  context: { serverTiming, logger },
}: LoaderArgs) {
  const artistID = params.artistID
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )

  if (!artistID) {
    throw badRequest({
      error: 'artistID must be provided as route param',
      logger,
    })
  }

  const { album, artist } = await retry(async (_, attempt) => {
    const resp = await promiseHash({
      album: serverTiming.track('spotify.albumFetch', () =>
        spotify.getRandomAlbumForRelatedArtistByID(artistID)
      ),
      artist: serverTiming.track('spotify.artistFetch', () =>
        spotify.getArtistByID(artistID)
      ),
    })
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return resp
  }, config.asyncRetryConfig)

  const wiki = await serverTiming.track('wikipedia', () => {
    if (!album) {
      throw serverError(
        {
          error: 'could not fetch album',
          logger,
        },
        { headers: serverTiming.headers() }
      )
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
    },
    {
      headers: {
        'Set-Cookie': await userSettings.setLastPresented({
          request,
          lastPresented: album.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {}
  }

  const title = `Discover music similar to ${data.artist.name}`
  const description = `We think that you might like ${data.album.artists[0].name}`
  const ogImage = `${env.OG_API_URL}/api/artist/${data.artist.id}`

  return {
    title: `${title} | ${config.siteTitle}`,
    description,
    'og:title': title,
    'og:description': description,
    'og:image': ogImage,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': ogImage,
  }
}

export default function RelatedArtistSearch() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Artist', data.artist.name ?? '']} hideFooter>
      <Album album={data.album} wiki={data.wiki} />
    </Layout>
  )
}
