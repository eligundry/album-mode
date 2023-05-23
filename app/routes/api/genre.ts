import { LoaderFunction, json } from '@remix-run/node'

import database from '~/lib/database/index.server'

import config from '~/config'

export const loader: LoaderFunction = async ({ request }) => {
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
