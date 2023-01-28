import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import promiseHash from 'promise-hash'
import { badRequest, serverError } from 'remix-utils'

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
import env from '~/env.server'

export async function loader({
  request,
  context: { serverTiming, logger },
}: LoaderArgs) {
  const url = new URL(request.url)
  let artistParam = url.searchParams.get('artist')
  const artistID = url.searchParams.get('artistID')
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  let album:
    | Awaited<ReturnType<(typeof spotify)['getRandomAlbumForArtistByID']>>
    | undefined
  let artist: SpotifyApi.ArtistObjectFull | undefined

  if (artistParam) {
    let searchMethod = spotify.getRandomAlbumForRelatedArtist

    // If the search term is quoted, get random album for just that artist
    if (artistParam.startsWith('"') && artistParam.endsWith('"')) {
      searchMethod = spotify.getRandomAlbumForArtist
    }

    album = await serverTiming.track('spotify.fetch', () =>
      searchMethod(artistParam as string)
    )
    artist = album.artists[0]
  } else if (artistID) {
    const resp = await retry(async (_, attempt) => {
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
    album = resp.album
    artist = resp.artist
  } else {
    throw badRequest({
      error: 'artist OR artistID query param must be provided',
      logger,
    })
  }

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
    <Layout headerBreadcrumbs={['Artist', data.artist.name ?? '']}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
