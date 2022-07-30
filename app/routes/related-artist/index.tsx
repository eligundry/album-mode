import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const artist = url.searchParams.get('artist')

  if (!artist) {
    throw json({ error: 'artist query param must be provided' }, 400)
  }

  const spotify = await spotifyLib.initializeFromRequest(request)
  let searchMethod = spotify.getRandomAlbumForRelatedArtist

  // If the search term is quoted, get random album for just that artist
  if (artist.startsWith('"') && artist.endsWith('"')) {
    searchMethod = spotify.getRandomAlbumForArtist
  }

  const album = await searchMethod(artist)

  if (!album) {
    throw json({ error: 'could not fetch album' }, 500)
  }

  const wiki = await wikipedia.getSummaryForAlbum({
    album: album.name,
    artist: album.artists[0].name,
  })

  return json({
    album,
    artist,
    wiki,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function RelatedArtistSearch() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout headerBreadcrumbs={['Artist', data.artist]}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
