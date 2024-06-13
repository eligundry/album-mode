import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import { getRequestContextValues } from '~/lib/context.server'

import { Container, Heading, Layout } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import GenreSearchForm from '~/components/Forms/GenreSearch'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { database } = getRequestContextValues(request, context)
  return json({
    topGenres: await database.getTopGenres(300),
  })
}

export const ErrorBoundary = PageErrorBoundary

export default function Genres() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Search by Genre</Heading>
        <GenreSearchForm />
        <ButtonLinkGroup
          items={data.topGenres}
          toFunction={(genre) => `/genre/${genre}`}
          keyFunction={(genre) => genre}
          childFunction={(genre) => genre}
          wrapperClassName={clsx('mt-4')}
        />
      </Container>
    </Layout>
  )
}
