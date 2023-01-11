import { ActionArgs, LoaderArgs, json } from '@remix-run/node'

import { spotifyStrategy } from '~/lib/auth.server'
import librarySync from '~/lib/librarySync.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, context }: ActionArgs) {
  const { serverTiming } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session.user) {
    throw json({ error: 'must be logged into spotify to use this route' }, 401)
  }

  const userID = session.user.id

  try {
    var item = await request.json()
  } catch (e: any) {
    throw json({ error: 'could not load json', detail: e?.message }, 400)
  }

  try {
    await serverTiming.track('librarySync.saveItem', () =>
      librarySync.saveItem(userID, item)
    )
  } catch (e: any) {
    throw json({ error: 'could not save item', detail: e?.message }, 500)
  }

  return json(
    { msg: 'saved item', item },
    {
      status: 201,
      headers: {
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session.user) {
    throw json({ error: 'must be logged into spotify to use this route' }, 401)
  }

  const userID = session.user.id

  try {
    var library = await serverTiming.track('librarySync.saveItem', () =>
      librarySync.getLibrary(userID)
    )
  } catch (e: any) {
    throw json({ error: 'could not fetch library', detail: e?.message }, 500)
  }

  return json(library, {
    headers: {
      [serverTiming.headerKey]: serverTiming.toString(),
    },
  })
}
