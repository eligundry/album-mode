import { ActionArgs, LoaderArgs, json } from '@remix-run/node'
import promiseHash from 'promise-hash'

import { spotifyStrategy } from '~/lib/auth.server'
import librarySync from '~/lib/librarySync.server'
import { badRequest, serverError, unauthorized } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'
import { SavedLibraryItem } from '~/lib/types/library'
import userSettings from '~/lib/userSettings.server'

// Save an item by POSTing it to this endpoint
export async function action({ request, context }: ActionArgs) {
  const { serverTiming, logger } = context
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
    var item: SavedLibraryItem = await request.json()
  } catch (e: any) {
    throw badRequest({
      error: 'could not load json',
      detail: e?.message,
      logger,
    })
  }

  try {
    await Promise.all(
      [
        serverTiming.track('librarySync.saveItem', () =>
          librarySync.saveItem(userID, item)
        ),
        item.type === 'album' &&
          settings.saveAlbumAutomatically &&
          serverTiming.track(
            'spotify.saveAlbum',
            () =>
              item.type === 'album' &&
              spotify.saveAlbum(item.id).catch((error) =>
                logger.warn({
                  message: 'could not save album on Spotify',
                  error,
                })
              )
          ),
        item.type === 'album' &&
          settings.followArtistAutomatically &&
          serverTiming.track(
            'spotify.followArtist',
            () =>
              item.type === 'album' &&
              spotify
                .followArtist(item.artists.map((a) => a.id))
                .catch((error) =>
                  logger.warn({
                    message: 'could not follow artist on Spotify',
                    error,
                  })
                )
          ),
      ].filter(Boolean)
    )
  } catch (e: any) {
    throw serverError({
      error: 'could not save item',
      detail: e?.message,
      logger,
    })
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
  const { serverTiming, logger } = context
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
    var library = await serverTiming.track('librarySync.saveItem', () =>
      librarySync.getLibrary(userID)
    )
  } catch (e: any) {
    throw serverError({
      error: 'could not fetch library',
      detail: e?.message,
      logger,
    })
  }

  return json(library, {
    headers: {
      [serverTiming.headerKey]: serverTiming.toString(),
    },
  })
}
