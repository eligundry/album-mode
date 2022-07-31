import { LoaderFunction, json } from '@remix-run/node'

import db from '~/lib/db'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const genre = url.searchParams.get('genre')

  if (!genre) {
    throw json({ error: 'genre must be provided in the query parameters' }, 400)
  }

  const genres = await db.searchGenres(genre)

  return json(genres)
}
