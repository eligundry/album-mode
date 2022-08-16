import React, { useCallback, useEffect, useMemo } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import useDeepCompareEffect from 'react-use/lib/useDeepCompareEffect'
import uniqBy from 'lodash/uniqBy'
import dateCompareDesc from 'date-fns/compareDesc'
import parseISO from 'date-fns/parseISO'

import usePeer from '~/hooks/usePeer'
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
  const { addBroadcastCallback, sendBroadcast } = usePeer()

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

      sendBroadcast('LIBRARY_SAVE_ITEM', {
        item: {
          ...savedItem,
          savedAt: savedItem.savedAt.toISOString(),
        },
      })
    },
    [setLibrary, sendBroadcast]
  )

  const removeItem = useCallback(
    async (savedAt: Date | string) => {
      setLibrary((lib) => {
        if (!lib) {
          return defaultLibrary
        }

        const strSavedAt =
          typeof savedAt === 'string' ? savedAt : savedAt.toISOString()

        sendBroadcast('LIBRARY_REMOVE_ITEM', { savedAt })

        return {
          ...lib,
          items: lib.items.filter(
            (l) => l.savedAt.toISOString() !== strSavedAt
          ),
        }
      })
    },
    [setLibrary, sendBroadcast]
  )

  useEffect(() => {
    addBroadcastCallback('LIBRARY_REMOVE_ITEM', ({ savedAt }) => {
      console.log('got a LIBRARY_REMOVE_ITEM event', savedAt)
      removeItem(savedAt)
    })
  }, [addBroadcastCallback, removeItem])

  useEffect(() => {
    addBroadcastCallback('LIBRARY_SAVE_ITEM', ({ item }) => {
      console.log('got a LIBRARY_SAVE_ITEM event', { item })
      saveItem(item)
    })
  }, [addBroadcastCallback, saveItem])

  // useEffect(() => {
  //   console.log('hello')
  //   addBroadcastCallback('LIBRARY_SYNC', (peerLibrary: Library) => {
  //     console.log('updating the library from an external peer')
  //     setLibrary((localLibrary) => {
  //       let newLibraryItems = [
  //         ...peerLibrary.items.map((item) => ({
  //           ...item,
  //           savedAt:
  //             typeof item.savedAt === 'string'
  //               ? parseISO(item.savedAt)
  //               : item.savedAt,
  //         })),
  //         ...(localLibrary?.items ?? []),
  //       ]
  //       newLibraryItems = uniqBy(newLibraryItems, (item) =>
  //         item.savedAt.toISOString()
  //       ).sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))

  //       return {
  //         ...(localLibrary ?? defaultLibrary),
  //         items: newLibraryItems,
  //       }
  //     })
  //   })
  // }, [addBroadcastCallback])

  // useDeepCompareEffect(() => {
  //   console.log('useDeepCompareEffect fired')
  //   sendBroadcast('LIBRARY_SYNC', library)
  // }, [library])

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

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export default LibraryProvider
