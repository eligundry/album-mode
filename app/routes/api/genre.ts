import { LoaderFunction, json } from '@remix-run/node'

import db from '~/lib/db.server'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')
  const genres = await (!genre ? db.getTopGenres() : db.searchGenres(genre))
  const cacheLifetime = 60 * 60 * 24

  return json(genres, {
    headers: {
      'Cache-Control': `public, max-age=${cacheLifetime}, s-maxage=${cacheLifetime}`,
    },
  })
}
