import {
  useAsync,
  useLocalStorageValue as useLocalStorage,
  useMountEffect,
} from '@react-hookz/web'
import dateCompareDesc from 'date-fns/compareDesc'
import parseISO from 'date-fns/parseISO'
import uniqBy from 'lodash/uniqBy'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Library,
  LibraryItem,
  LocalLibraryItem,
  ServerLibraryItem,
  defaultLibrary,
} from '~/lib/types/library'

import useUser from '~/hooks/useUser'

export interface ILibraryContext {
  library: Library
  saveItem: (item: Omit<LocalLibraryItem, 'savedAt'>) => Promise<void>
  removeItem: (item: LibraryItem) => Promise<void>
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
  const { value: library, set: setLibrary } = useLocalStorage<Library>(
    'albumModeLibraryV2',
    {
      defaultValue: defaultLibrary,
      initializeWithValue: true,
      stringify: (value) => JSON.stringify(value),
      parse: (value, fallback) => {
        if (!value) {
          return fallback
        }

        return JSON.parse(value, (key, value) => {
          if (key === 'savedAt') {
            return new Date(value)
          }

          return value
        })
      },
    }
  )

  const saveItem = useCallback(
    async (item: Omit<LocalLibraryItem, 'savedAt'>) => {
      const savedItem = {
        savedAt: new Date(),
        ...item,
      }

      setLibrary((lib) => {
        let updatedLibrary = lib

        if (!updatedLibrary) {
          updatedLibrary = defaultLibrary
        }

        updatedLibrary.push(savedItem)

        return updatedLibrary
      })

      if (user?.id) {
        await fetch('/api/library', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(savedItem),
        }).then(async (resp) => {
          if (!resp.ok) return
          const savedItem = await resp.json()

          setLibrary((lib) => {
            if (!lib) {
              return [savedItem]
            }

            let updatedLibrary = lib?.filter((i) => i.url !== item.url)
            updatedLibrary.push(savedItem)

            return updatedLibrary
          })
        })
      }
    },
    [setLibrary, user?.id]
  )

  const removeItem = useCallback(
    async (item: LibraryItem) => {
      setLibrary((lib) => {
        if (!lib) {
          return defaultLibrary
        }

        return lib.filter((l) => l.url !== item.url)
      })

      if (user?.id && 'id' in item && item.id) {
        await fetch(`/api/library/${item.id}`, {
          method: 'DELETE',
        })
      }
    },
    [setLibrary, user?.id]
  )

  /**
   * Effect that fetches the library from the server, syncs unsaved items to it,
   * and then merges them together. This allows the library to by synced across
   * devices, if the user is logged in via Spotify.
   */
  const [librarySyncState, remoteLibrarySync] = useAsync(async () => {
    if (loadedServerLibrary || !library || !user?.id) {
      return
    }

    const resp = await fetch('/api/library')
    const serverLibrary: ServerLibraryItem[] = await resp.json()
    const serverLibraryItemURLs = serverLibrary.map((item) => item.url)
    const unsavedLibraryItems = library.filter(
      (item) => !serverLibraryItemURLs.includes(item.url) && !('id' in item)
    )

    const syncedLibraryItems = await Promise.all(
      unsavedLibraryItems.map(
        async (localItem): Promise<ServerLibraryItem | false> => {
          const resp = await fetch('/api/library', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(localItem),
          })

          if (!resp.ok) {
            return false
          }

          const savedItem = await resp.json()

          return savedItem
        }
      )
    )

    setLibrary([
      ...serverLibrary,
      ...syncedLibraryItems.filter((i): i is ServerLibraryItem => !!i),
    ])
    setLoadedServerLibrary(true)
  })

  useMountEffect(() => {
    remoteLibrarySync.execute()
  })

  useEffect(() => {
    if (librarySyncState.error) {
      console.error(librarySyncState.error)
    }
  }, [librarySyncState.error])

  const value = useMemo<ILibraryContext>(
    () => ({
      library: library
        ? library.sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))
        : [],
      saveItem,
      removeItem,
    }),
    [library, saveItem, removeItem]
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export default LibraryProvider
