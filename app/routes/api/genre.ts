import { LoaderFunction, json } from '@remix-run/node'

import config from '~/config'
import db from '~/lib/db.server'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')
  const genres = await (!genre ? db.getTopGenres() : db.searchGenres(genre))

  return json(genres, {
    headers: {
      'Cache-Control': config.cacheControl.public,
    },
  })
}
