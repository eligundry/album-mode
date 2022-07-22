import { useCallback } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'

import { Library, LibraryItem, defaultLibrary } from '~/lib/types/library'

export type { LibraryItem }

/**
 * useAlbumLibrary is a hook that stores the albums the user gives a thumbs up
 * to in the browser's local storage.
 */
export default function useLibrary() {
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

  const saveItem = useCallback(
    (item: LibraryItem) =>
      setLibrary((l) => {
        let updatedLibrary = l

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

  return { library, saveItem }
}
