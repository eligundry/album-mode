import { ActionArgs, LoaderArgs, json } from '@remix-run/node'

import librarySync from '~/lib/librarySync.server'
import spotifyLib from '~/lib/spotify.server'

// Save an item by POSTing it to this endpoint
export async function action({ request }: ActionArgs) {
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
    var item = await request.json()
  } catch (e: any) {
    throw json({ error: 'could not load json', detail: e?.message }, 400)
  }

  try {
    await librarySync.saveItem(user.uri, item)
  } catch (e: any) {
    throw json({ error: 'could not save item', detail: e?.message }, 500)
  }

  return json({ msg: 'saved item', item }, 201)
}

export async function loader({ request }: LoaderArgs) {
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
    var library = await librarySync.getLibrary(user.uri)
  } catch (e: any) {
    throw json({ error: 'could not fetch library', detail: e?.message }, 500)
  }

  return json(library)
}
