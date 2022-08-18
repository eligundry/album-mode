import React, { useCallback, useMemo, useState, useEffect } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import useAsync from 'react-use/lib/useAsync'
import uniqBy from 'lodash/uniqBy'
import dateCompareDesc from 'date-fns/compareDesc'
import parseISO from 'date-fns/parseISO'

import useUser from '~/hooks/useUser'
import {
  CurrentLibrary,
  CurrentLibraryVersion,
  Library,
  LibraryItem,
  SavedLibraryItem,
  defaultLibrary,
} from '~/lib/types/library'

export interface ILibraryContext {
  library: Library['items']
  saveItem: (item: LibraryItem) => Promise<void>
  removeItem: (savedAt: Date) => Promise<void>
}

export const LibraryContext = React.createContext<ILibraryContext>({
  library: [],
  saveItem: async (item) => {
    console.warn('called saveItem without a LibraryProvider', { item })
  },
  removeItem: async (item) => {
    console.warn('called removeItem without a LibraryProvider', { item })
  },
})

const LibraryProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const user = useUser()
  const [loadedServerLibrary, setLoadedServerLibrary] = useState(false)
  const [library, setLibrary] = useLocalStorage<CurrentLibrary>(
    'albumModeLibrary',
    defaultLibrary,
    {
      raw: false,
      serializer: (value) => JSON.stringify(value),
      deserializer: (value) =>
        JSON.parse(value, (key, value) => {
          if (key === 'savedAt') {
            return new Date(value)
          }

          return value
        }),
    }
  )

  const saveItem = useCallback(
    async (item: LibraryItem | SavedLibraryItem) => {
      const savedItem = {
        savedAt: new Date(),
        ...item,
      }

      setLibrary((lib) => {
        let updatedLibrary = lib

        if (!updatedLibrary) {
          updatedLibrary = defaultLibrary
        }

        updatedLibrary.items.push(savedItem)

        return updatedLibrary
      })

      if (user?.uri) {
        await fetch('/api/library', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(savedItem),
        })
      }
    },
    [setLibrary, user?.uri]
  )

  const removeItem = useCallback(
    async (savedAt: Date | string) => {
      const strSavedAt =
        typeof savedAt === 'string' ? savedAt : savedAt.toISOString()

      setLibrary((lib) => {
        if (!lib) {
          return defaultLibrary
        }

        return {
          ...lib,
          items: lib.items.filter(
            (l) => l.savedAt.toISOString() !== strSavedAt
          ),
          removedItemTimestamps: Array.from(
            new Set([...lib.removedItemTimestamps, strSavedAt])
          ),
        }
      })

      if (user?.uri) {
        await fetch(`/api/library/${strSavedAt}`, {
          method: 'DELETE',
        })
      }
    },
    [setLibrary]
  )

  /**
   * Effect that fetches the library from the server, syncs unsaved items to it,
   * and then merges them together. This allows the library to by synced across
   * devices, if the user is logged in via Spotify.
   */
  const librarySyncState = useAsync(async () => {
    if (loadedServerLibrary || !library || !user?.uri) {
      return
    }

    const resp = await fetch('/api/library')
    const serverLibrary: CurrentLibrary = await resp.json()
    const serverLibraryItemsSavedAt = serverLibrary.items.map((item) =>
      typeof item.savedAt === 'string'
        ? item.savedAt
        : item.savedAt.toISOString()
    )

    await Promise.all(
      library.items.map(async (localItem) => {
        const shouldBySynced =
          !serverLibraryItemsSavedAt.includes(
            localItem.savedAt.toISOString()
          ) &&
          !serverLibrary?.removedItemTimestamps?.includes(
            localItem.savedAt.toISOString()
          )

        if (!shouldBySynced) {
          return
        }

        fetch('/api/library', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(localItem),
        })
      })
    )

    setLibrary(mergeLibraryItems(library, serverLibrary))
    setLoadedServerLibrary(true)
  }, [loadedServerLibrary, user?.uri])

  useEffect(() => {
    if (librarySyncState.error) {
      console.error(librarySyncState.error)
    }
  }, [librarySyncState.error])

  const value = useMemo<ILibraryContext>(
    () => ({
      library: library?.items
        ? library.items.sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))
        : [],
      saveItem,
      removeItem,
    }),
    [library, saveItem, removeItem, librarySyncState.loading]
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

const mergeLibraryItems = (
  localLibrary: Library,
  serverLibrary: Library
): CurrentLibrary => {
  const newRemovedAtTimeStamps = Array.from(
    new Set([
      ...('removedItemTimestamps' in localLibrary
        ? localLibrary.removedItemTimestamps
        : []),
      ...('removedItemTimestamps' in serverLibrary
        ? serverLibrary.removedItemTimestamps
        : []),
    ])
  )
  let newLibraryItems = [
    ...serverLibrary.items.map((item) => ({
      ...item,
      savedAt:
        typeof item.savedAt === 'string'
          ? parseISO(item.savedAt)
          : item.savedAt,
    })),
    ...localLibrary.items,
  ]
  newLibraryItems = uniqBy(newLibraryItems, (item) =>
    item.savedAt.toISOString()
  )
    .filter(
      (item) =>
        !newRemovedAtTimeStamps.includes(
          typeof item.savedAt === 'string'
            ? item.savedAt
            : item.savedAt.toISOString()
        )
    )
    .sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))

  return {
    version: CurrentLibraryVersion,
    items: newLibraryItems,
    removedItemTimestamps: newRemovedAtTimeStamps,
  }
}

export default LibraryProvider
