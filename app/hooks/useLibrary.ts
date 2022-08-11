import { useCallback, useMemo } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import useDeepCompareEffect from 'react-use/lib/useDeepCompareEffect'
// import { Peer } from 'peerjs'

import { Library, LibraryItem, defaultLibrary } from '~/lib/types/library'
import useUser from '~/hooks/useUser'

export type { LibraryItem }

/**
 * useAlbumLibrary is a hook that stores the albums the user gives a thumbs up
 * to in the browser's local storage.
 */
export default function useLibrary() {
  const user = useUser()
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
    (item: LibraryItem) =>
      setLibrary((lib) => {
        let updatedLibrary = lib

        if (!updatedLibrary) {
          updatedLibrary = defaultLibrary
        }

        updatedLibrary.items.push({
          ...item,
          savedAt: new Date(),
        })

        return updatedLibrary
      }),
    [setLibrary]
  )

  const removeItem = useCallback(
    async (savedAt: Date) => {
      setLibrary((lib) => {
        if (!lib) {
          return defaultLibrary
        }

        return {
          ...lib,
          items: lib.items.filter(
            (l) => l.savedAt.toISOString() !== savedAt.toISOString()
          ),
        }
      })
    },
    [setLibrary]
  )

  useDeepCompareEffect(() => {
    if (!user) {
      return
    }

    console.log({ user })
  }, [user])

  return useMemo(() => {
    return {
      library: library?.items ? [...library.items].reverse() : [],
      saveItem,
      removeItem,
    }
  }, [libraryLength, saveItem, removeItem])
}
