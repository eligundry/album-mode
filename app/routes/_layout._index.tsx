import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getRequestContextValues } from '~/lib/context.server'

import { Container } from '~/components/Base'
import { PageErrorBoundary } from '~/components/ErrorBoundary'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { database } = getRequestContextValues(request, context)

  return json({})
}

export const ErrorBoundary = PageErrorBoundary

export default function Index() {
  const _data = useLoaderData<typeof loader>()

  return (
    <Container>
      <h1>TBD</h1>
    </Container>
  )
}
