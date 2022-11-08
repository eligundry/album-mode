import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary, {
  AlbumCatchBoundary,
} from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'
import ServerTiming from '~/lib/serverTiming.server'

export async function loader({ request }: LoaderArgs) {
  const headers = new Headers()
  const serverTiming = new ServerTiming()
  const url = new URL(request.url)
  let artist = url.searchParams.get('artist')
  const artistID = url.searchParams.get('artistID')
  const spotify = await serverTiming.time('spotify-init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  let album: SpotifyApi.AlbumObjectSimplified | undefined

  if (artist) {
    let searchMethod = spotify.getRandomAlbumForRelatedArtist

    // If the search term is quoted, get random album for just that artist
    if (artist.startsWith('"') && artist.endsWith('"')) {
      searchMethod = spotify.getRandomAlbumForArtist
    }

    album = await serverTiming.time('spotify-fetch', () =>
      searchMethod(artist as string)
    )
  } else if (artistID) {
    ;[album, artist] = await Promise.all([
      serverTiming.time('spotify-album-fetch', () =>
        spotify.getRandomAlbumForRelatedArtistByID(artistID)
      ),
      serverTiming.time('spotify-artist-name-fetch', () =>
        spotify
          .getClient()
          .then((client) => client.getArtist(artistID))
          .then((resp) => resp.body.name)
      ),
    ])
  } else {
    throw json(
      { error: 'artist OR artistID query param must be provided' },
      400
    )
  }

  const wiki = await serverTiming.time('wikipedia', () => {
    if (!album) {
      throw json({ error: 'could not fetch album' }, 500)
    }

    return wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })
  })
  headers.set('Set-Cookie', await lastPresented.set(request, album.id))
  headers.set(serverTiming.headerKey, serverTiming.header())

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
    <Layout headerBreadcrumbs={['Artist', data.artist ?? '']}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
