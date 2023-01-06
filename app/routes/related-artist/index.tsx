import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import promiseHash from 'promise-hash'

import lastPresented from '~/lib/lastPresented.server'
import spotifyLib from '~/lib/spotify.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import { Layout } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import config from '~/config'

export async function loader({ request, context }: LoaderArgs) {
  const headers = new Headers()
  const { serverTiming } = context
  const url = new URL(request.url)
  let artistParam = url.searchParams.get('artist')
  const artistID = url.searchParams.get('artistID')
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  let album:
    | Awaited<ReturnType<typeof spotify['getRandomAlbumForArtistByID']>>
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
    throw json(
      { error: 'artist OR artistID query param must be provided' },
      400
    )
  }

  const wiki = await serverTiming.track('wikipedia', () => {
    if (!album) {
      throw json(
        { error: 'could not fetch album' },
        {
          status: 500,
          headers: serverTiming.headers(),
        }
      )
    }

    return wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  })
  headers.set('Set-Cookie', await lastPresented.set(request, album.id))
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json(
    {
      album,
      artist,
      wiki,
    },
    { headers }
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const CatchBoundary = AlbumCatchBoundary

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
