import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout, Heading, ButtonLink, Container } from '~/components/Base'
import GenreSearchForm from '~/components/Forms/GenreSearch'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({
      topGenres: await db.getTopGenres(300),
    })
  }

  return json({
    album: await spotify.getRandomAlbumByGenre(q),
    genre: q,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function GenreSearch() {
  const data = useLoaderData<typeof loader>()

  if ('album' in data) {
    const { album, genre } = data

    if (!album?.external_urls?.spotify) {
      return null
    }

    return (
      <Layout headerBreadcrumbs={['Genre', genre]}>
        <Album album={album} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        <Heading level="h2">Search by Genre</Heading>
        <GenreSearchForm defaultGenres={data.topGenres} />
        <div className={clsx('button-group', 'mt-4')}>
          {data.topGenres.map((genre) => (
            <ButtonLink
              to={`/genre?q=${genre}`}
              key={genre}
              className={clsx('mr-2', 'mb-2')}
              color="info"
            >
              {genre}
            </ButtonLink>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
