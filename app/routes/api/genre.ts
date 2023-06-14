import { LoaderFunction, json } from '@remix-run/cloudflare'

import config from '~/config'

export const loader: LoaderFunction = async ({
  request,
  context: { database },
}) => {
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
