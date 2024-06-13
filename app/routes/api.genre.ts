import { LoaderFunction, json } from '@remix-run/node'

import { getRequestContextValues } from '~/lib/context.server'

import config from '~/config'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { database } = getRequestContextValues(request, context)
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')
  const genres = await (!genre
    ? database.getTopGenres()
    : database.searchGenres(genre))

  return json(genres, {
    headers: {
      'Cache-Control': config.cacheControl.publicLonger,
    },
  })
}
