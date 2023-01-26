import { ActionArgs } from '@remix-run/node'

import { spotifyStrategy } from '~/lib/auth.server'
import librarySync from '~/lib/librarySync.server'
import {
  badRequest,
  noContent,
  serverError,
  unauthorized,
} from '~/lib/responses.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, params, context }: ActionArgs) {
  const savedAt = params.savedAt

  if (!savedAt) {
    throw badRequest({
      error: 'savedAt must be provided in the url',
      logger: context.logger,
    })
  }

  const { serverTiming } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session?.user) {
    throw unauthorized({
      error: 'must be logged into spotify to use this route',
      logger: context.logger,
    })
  }

  const userID = session.user.id

  try {
    await serverTiming.track('librarySync.removeItem', () =>
      librarySync.removeItem(userID, savedAt)
    )
  } catch (e: any) {
    throw serverError({
      error: 'could not remove item',
      detail: e?.message,
      logger: context.logger,
    })
  }

  return noContent({
    headers: {
      [serverTiming.headerKey]: serverTiming.toString(),
    },
  })
}
