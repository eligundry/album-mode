import { LoaderFunction, json } from '@remix-run/node'

import db from '~/lib/db'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({ error: 'q must be provided in the query parameters' }, 400)
  }

  const genres = await db.searchGenres(q)

  return json(genres)
}
