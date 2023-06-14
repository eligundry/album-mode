import { LoaderArgs, redirect } from '@remix-run/cloudflare'

import { badRequest } from '~/lib/responses.server'

export async function loader({ request, context: { logger } }: LoaderArgs) {
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
