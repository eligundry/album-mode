import { ActionArgs, json } from '@remix-run/node'

import librarySync from '~/lib/librarySync.server'
import spotifyLib from '~/lib/spotify.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, params }: ActionArgs) {
  const savedAt = params.savedAt

  if (!savedAt) {
    throw json({ error: 'savedAt must be provided in the url' }, 400)
  }

  const spotify = await spotifyLib.initializeFromRequest(request)

  try {
    var user = await spotify.getUser()

    if (!user) {
      throw 'nope!'
    }
  } catch (e) {
    throw json({ error: 'must be logged into spotify to use this route' }, 401)
  }

  try {
    await librarySync.removeItem(user.uri, savedAt)
  } catch (e: any) {
    throw json({ error: 'could not remove item', detail: e?.message }, 500)
  }

  return json({ msg: 'removed item' })
}
