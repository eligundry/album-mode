import React, { useCallback, useMemo, useState } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import useAsync from 'react-use/lib/useAsync'
import uniqBy from 'lodash/uniqBy'
import dateCompareDesc from 'date-fns/compareDesc'
import parseISO from 'date-fns/parseISO'

import useUser from '~/hooks/useUser'
import {
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
  const [library, setLibrary] = useLocalStorage<Library>(
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

  const libraryLength = library?.items.length ?? 0

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

      if (user?.uri) {
        await fetch(`/api/library/${strSavedAt}`, {
          method: 'DELETE',
        })
      }

      setLibrary((lib) => {
        if (!lib) {
          return defaultLibrary
        }

        return {
          ...lib,
          items: lib.items.filter(
            (l) => l.savedAt.toISOString() !== strSavedAt
          ),
        }
      })
    },
    [setLibrary]
  )

  const value = useMemo<ILibraryContext>(
    () => ({
      library: library?.items
        ? library.items.sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))
        : [],
      saveItem,
      removeItem,
    }),
    [libraryLength, saveItem, removeItem]
  )

  /**
   * Effect that fetches the library from the server, syncs unsaved items to it,
   * and then merges them together. This allows the library to by synced across
   * devices, if the user is logged in via Spotify.
   */
  useAsync(async () => {
    if (loadedServerLibrary || !library || !user?.uri) {
      return
    }

    const resp = await fetch('/api/library')
    const serverLibraryItems: SavedLibraryItem[] = await resp.json()
    const serverLibraryItemsSavedAt = serverLibraryItems.map((item) =>
      typeof item.savedAt === 'string'
        ? item.savedAt
        : item.savedAt.toISOString()
    )

    await Promise.all(
      library.items.map(async (localItem) => {
        if (
          serverLibraryItemsSavedAt.includes(localItem.savedAt.toISOString())
        ) {
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

    setLibrary(mergeLibraryItems(library, serverLibraryItems))
    setLoadedServerLibrary(true)
  }, [loadedServerLibrary, user?.uri])

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

const mergeLibraryItems = (
  localLibrary: Library,
  serverLibraryItems: SavedLibraryItem[]
): Library => {
  let newLibraryItems = [
    ...serverLibraryItems.map((item) => ({
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
  ).sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))

  return {
    ...(localLibrary ?? defaultLibrary),
    items: newLibraryItems,
  }
}

export default LibraryProvider
