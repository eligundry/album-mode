import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout, Heading, Container } from '~/components/Base'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'

export async function loader() {
  return json({
    topGenres: await db.getTopGenres(300),
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function Genres() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Search by Genre</Heading>
        <GenreSearchForm defaultGenres={data.topGenres} />
        <ButtonLinkGroup
          items={data.topGenres}
          toFunction={(genre) => `/genre?q=${genre}`}
          keyFunction={(genre) => genre}
          childFunction={(genre) => genre}
          wrapperClassName={clsx('mt-4')}
        />
      </Container>
    </Layout>
  )
}
