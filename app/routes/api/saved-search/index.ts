import { ActionArgs, LoaderArgs, json } from '@remix-run/cloudflare'
import { z } from 'zod'

import { spotifyStrategy } from '~/lib/auth.server'
import { badRequest, serverError, unauthorized } from '~/lib/responses.server'

const schema = z.object({
  crumbs: z.array(z.string()),
  path: z.string(),
})

export async function action({ request, context }: ActionArgs) {
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
  const res = schema.safeParse(await request.json())

  if (!res.success) {
    throw badRequest({
      logger,
      error: res.error.message,
      issues: res.error.issues,
    })
  }

  try {
    const savedSearch = await serverTiming.track('db.saveSearch', () =>
      database.saveSearch({
        item: res.data,
        username: userID,
      })
    )

    return json(savedSearch, {
      status: 201,
      headers: serverTiming.headers(),
    })
  } catch (e: any) {
    throw serverError({ logger, error: e })
  }
}

export async function loader({ request, context }: LoaderArgs) {
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

  try {
    const searches = await serverTiming.track('db.getSavedSearches', () =>
      database.getSavedSearches(userID)
    )

    return json(searches, {
      headers: serverTiming.headers(),
    })
  } catch (e: any) {
    throw serverError({ logger, error: e })
  }
}
