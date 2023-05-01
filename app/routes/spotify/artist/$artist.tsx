import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest, serverError } from 'remix-utils'

import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import config from '~/config'
import env from '~/env.server'

export async function loader({
  request,
  params,
  context: { serverTiming, logger },
}: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  let artistParam = params.artist

  if (!artistParam) {
    throw badRequest({
      error: 'artist name must be provided as a route param',
      logger,
    })
  }

  let searchMethod = spotify.getRandomAlbumForRelatedArtist

  // If the search term is quoted, get random album for just that artist
  if (artistParam.startsWith('"') && artistParam.endsWith('"')) {
    searchMethod = spotify.getRandomAlbumForArtist
  }

  const album = await serverTiming.track('spotify.fetch', () =>
    searchMethod(artistParam as string)
  )
  const artist = album.artists[0]

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
export const CatchBoundary = AlbumCatchBoundary
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
