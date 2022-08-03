import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotifyLib from '~/lib/spotify.server'
import { Layout } from '~/components/Base'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import wikipedia from '~/lib/wikipedia.server'
import WikipediaSummary from '~/components/WikipediaSummary'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  let artist = url.searchParams.get('artist')
  const artistID = url.searchParams.get('artistID')
  const spotify = await spotifyLib.initializeFromRequest(request)
  let album: SpotifyApi.AlbumObjectSimplified | undefined

  if (artist) {
    let searchMethod = spotify.getRandomAlbumForRelatedArtist

    // If the search term is quoted, get random album for just that artist
    if (artist.startsWith('"') && artist.endsWith('"')) {
      searchMethod = spotify.getRandomAlbumForArtist
    }

    album = await searchMethod(artist)
  } else if (artistID) {
    album = await spotify.getRandomAlbumForRelatedArtistByID(artistID)
    artist = await spotify
      .getClient()
      .then((client) => client.getArtist(artistID))
      .then((resp) => resp.body.name)
  } else {
    throw json(
      { error: 'artist OR artistID query param must be provided' },
      400
    )
  }

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
    <Layout headerBreadcrumbs={['Artist', data.artist ?? '']}>
      <Album
        album={data.album}
        footer={<WikipediaSummary summary={data.wiki} />}
      />
    </Layout>
  )
}
