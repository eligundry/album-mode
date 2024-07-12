import { LoaderFunction, json } from '@remix-run/node'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import { getRequestContextValues } from '~/lib/context.server'
import { badRequest } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'

import config from '~/config'

const paramsSchema = zfd.formData({
  search: zfd.text().optional(),
  artistLimit: z.coerce.number().min(1).max(50).optional().default(5),
  genreLimit: z.coerce.number().min(1).max(50).optional().default(10),
})

export const loader: LoaderFunction = async ({ request, context }) => {
  const { serverTiming, logger, database } = getRequestContextValues(
    request,
    context,
  )
  const paramsParse = paramsSchema.safeParse(new URL(request.url).searchParams)

  if (!paramsParse.success) {
    throw badRequest({
      logger,
      error: 'invalid query paramters',
      issues: paramsParse.error.issues,
    })
  }

  const params = paramsParse.data
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const [artists, genres] = await Promise.all([
    params.search
      ? spotify.searchArists(params.search, params.artistLimit)
      : spotify.getUserTopArtists(params.artistLimit),
    params.search
      ? database.searchGenres(params.search, params.genreLimit)
      : database.getTopGenres(params.genreLimit),
  ])

  return json(
    { artists, genres },
    {
      headers: {
        'cache-control': config.cacheControl.private,
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    },
  )
}
