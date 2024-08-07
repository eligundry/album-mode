import { ActionFunctionArgs } from '@remix-run/node'

import { spotifyStrategy } from '~/lib/auth.server'
import { getRequestContextValues } from '~/lib/context.server'
import {
  badRequest,
  noContent,
  serverError,
  unauthorized,
} from '~/lib/responses.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, params, context }: ActionFunctionArgs) {
  const { logger, serverTiming, database } = getRequestContextValues(
    request,
    context,
  )

  const id = parseInt(params.id ?? '0')

  if (!id) {
    throw badRequest({
      error: 'id must be provided in the url',
      logger,
    })
  }

  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request),
  )

  if (!session || !session?.user) {
    throw unauthorized({
      error: 'must be logged into spotify to use this route',
      logger,
    })
  }

  const userID = session.user.id

  try {
    await serverTiming.track('db.removeItemFromLibrary', () =>
      database.removeItemFromLibrary({ username: userID, id: id }),
    )
  } catch (e: any) {
    throw serverError({
      error: 'could not remove item',
      detail: e?.message,
      logger,
    })
  }

  return noContent({
    headers: serverTiming.headers(),
  })
}
