import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import { Layout, Heading, ButtonLink, Container } from '~/components/Base'
import GenreSearchForm from '~/components/Forms/GenreSearch'

type LoaderData =
  | {
      album: Awaited<ReturnType<typeof spotify.getRandomAlbumByGenre>>
    }
  | {
      topGenres: Awaited<ReturnType<typeof db.getTopGenres>>
    }

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    const data: LoaderData = await promiseHash({
      topGenres: db.getTopGenres(),
    })

    return json(data)
  }

  const data: LoaderData = await promiseHash({
    album: spotify.getRandomAlbumByGenre(q),
  })

  return json(data)
}

export default function GenreSearch() {
  const data = useLoaderData<LoaderData>()

  if ('album' in data) {
    const { album } = data

    if (!album?.external_urls?.spotify) {
      return null
    }

    return (
      <Layout>
        <Album
          url={album.external_urls.spotify}
          artist={album.artists?.[0].name}
          album={album.name}
        />
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
              className={clsx('mr-2', 'mb-2', 'inline-block')}
            >
              {genre}
            </ButtonLink>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
