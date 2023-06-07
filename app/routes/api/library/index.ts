import { ActionArgs, LoaderArgs, json } from '@remix-run/node'
import promiseHash from 'promise-hash'

import { spotifyStrategy } from '~/lib/auth.server'
import { badRequest, serverError, unauthorized } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import { LocalLibraryItem } from '~/lib/types/library'
import userSettings from '~/lib/userSettings.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, context }: ActionArgs) {
  const { serverTiming, logger, database } = context
  const { session, settings, spotify } = await promiseHash({
    session: serverTiming.track('spotify.session', () =>
      spotifyStrategy.getSession(request)
    ),
    settings: serverTiming.track('userSettings.get', () =>
      userSettings.get(request)
    ),
    spotify: serverTiming.track('spotify.init', () =>
      spotifyLib.initializeFromRequest(request, context)
    ),
  })

  if (!session || !session.user) {
    throw unauthorized({
      error: 'must be logged into spotify to use this route',
      logger,
    })
  }

  const userID = session.user.id

  try {
    var item: LocalLibraryItem = await request.json()
  } catch (e: any) {
    throw badRequest({
      error: 'could not load json',
      detail: e?.message,
      logger,
    })
  }

  let spotifyAlbumID: string | null = null
  let spotifyArtistID: string | null = null

  if (item.service === 'spotify') {
    spotifyAlbumID =
      item.url.match(/open.spotify.com\/album\/(.*)$/)?.[1] ?? null
    spotifyArtistID =
      item.url.match(/open.spotify.com\/artist\/(.*)$/)?.[1] ?? null
  }

  try {
    var { savedItem } = await promiseHash({
      savedItem: serverTiming.track('db.saveItemToLibrary', () =>
        database.saveItemToLibrary({
          item,
          username: userID,
        })
      ),
      saveAlbum:
        spotifyAlbumID &&
        settings.saveAlbumAutomatically &&
        serverTiming.track(
          'spotify.saveAlbum',
          () =>
            spotifyAlbumID &&
            spotify.saveAlbum(spotifyAlbumID).catch((error) => {
              logger.warn({
                message: 'could not save album on Spotify',
                error,
              })
              serverTiming.add('spotify.saveAlbum failed')
            })
        ),
      followArtist:
        spotifyArtistID &&
        settings.followArtistAutomatically &&
        serverTiming.track(
          'spotify.followArtist',
          () =>
            spotifyArtistID &&
            spotify.followArtist(spotifyArtistID).catch((error) => {
              logger.warn({
                message: 'could not follow artist on Spotify',
                error,
              })
              serverTiming.add('spotify.followArtist failed')
            })
        ),
    })
  } catch (e: any) {
    throw serverError({
      error: 'could not save item',
      detail: e?.message,
      logger,
    })
  }

  return json(savedItem, {
    status: 201,
    headers: serverTiming.headers(),
  })
}

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming, logger, database } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )

  if (!session || !session.user) {
    throw unauthorized({
      error: 'must be logged into spotify to use this route',
      logger,
    })
  }

  const userID = session.user.id

  try {
    var library = await serverTiming.track('db.getLibrary', () =>
      database.getLibrary(userID)
    )
  } catch (e: any) {
    throw serverError({
      error: 'could not fetch library',
      detail: e?.message,
      logger,
    })
  }

  return json(library, {
    headers: serverTiming.headers(),
  })
}
