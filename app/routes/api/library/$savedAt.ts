import { ActionArgs, json } from '@remix-run/node'

import { spotifyStrategy } from '~/lib/auth.server'
import librarySync from '~/lib/librarySync.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, params, context }: ActionArgs) {
  const savedAt = params.savedAt

  if (!savedAt) {
    throw json({ error: 'savedAt must be provided in the url' }, 400)
  }

  const { serverTiming } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session?.user) {
    throw json({ error: 'must be logged into spotify to use this route' }, 401)
  }

  const userID = session.user.id

  try {
    await serverTiming.track('librarySync.removeItem', () =>
      librarySync.removeItem(userID, savedAt)
    )
  } catch (e: any) {
    throw json({ error: 'could not remove item', detail: e?.message }, 500)
  }

  return json(
    { msg: 'removed item' },
    {
      headers: {
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}
