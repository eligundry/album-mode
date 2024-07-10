import { LoaderFunctionArgs, redirect } from '@remix-run/node'

import { getRequestContextValues } from '~/lib/context.server'
import { badRequest } from '~/lib/responses.server'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger } = getRequestContextValues(request, context)
  const url = new URL(request.url)
  const artist = url.searchParams.get('artist')
  const artistID = url.searchParams.get('artistID')

  if (artist) {
    return redirect(`/spotify/artist/${artist}`)
  } else if (artistID) {
    return redirect(`/spotify/artist-id/${artistID}`)
  }

  throw badRequest({
    error: 'either artist or artistID must be provided as a query parameter',
    logger,
  })
}
