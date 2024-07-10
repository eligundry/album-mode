import { LoaderFunctionArgs, redirect } from '@remix-run/node'

import { getRequestContextValues } from '~/lib/context.server'
import { badRequest } from '~/lib/responses.server'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger } = getRequestContextValues(request, context)
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')

  if (!genre) {
    throw badRequest({
      error: 'genre query param must be provided to search via genre',
      logger,
    })
  }

  return redirect(`/genre/${genre}`)
}
