import { LoaderFunctionArgs, json } from '@remix-run/node'
import pick from 'lodash/pick'
import { promiseHash } from 'remix-utils/promise'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import spotifyLib from '~/lib/spotify.server'

const paramsSchema = zfd.formData({
  artistID: z.string(),
})

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { artistID } = paramsSchema.parse(new URL(request.url).searchParams)
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const { artist, relatedArtists } = await promiseHash({
    artist: spotify.getArtistByID(artistID),
    relatedArtists: spotify.getRelatedArtists(artistID),
  })

  return json({
    artist: pick(artist, ['name', 'images.0']),
    relatedArtists:
      relatedArtists?.map((ra) => pick(ra, ['name', 'images.0'])).slice(0, 3) ??
      [],
  })
}
