import { ActionArgs } from '@remix-run/cloudflare'

import { spotifyStrategy } from '~/lib/auth.server'
import {
  badRequest,
  noContent,
  serverError,
  unauthorized,
} from '~/lib/responses.server'

export async function action({ request, params, context }: ActionArgs) {
  const { serverTiming, logger, database } = context

  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session.user) {
    throw unauthorized({
      logger,
      error: 'must be logged into spotify to use this route',
    })
  }

  const userID = session.user.id
  const itemID = parseInt(params.id ?? '0')

  if (!itemID) {
    throw badRequest({
      logger,
      error: 'must provide an item id',
    })
  }

  try {
    await serverTiming.track('db.removeSearch', () =>
      database.removeSavedSearch({
        itemID,
        username: userID,
      })
    )

    return noContent({
      headers: serverTiming.headers(),
    })
  } catch (e: any) {
    throw serverError({ logger, error: e })
  }
}
