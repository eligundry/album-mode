import { useCallback } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'

export interface SavedAlbum {
  name: string
  artist: string
  albumURL: string
  savedAt: Date
}

/**
 * useAlbumLibrary is a hook that stores the albums the user gives a thumbs up
 * to in the browser's local storage.
 */
export default function useAlbumLibrary() {
  const [library, setLibrary] = useLocalStorage<SavedAlbum[]>(
    'likedAlbumsLibrary',
    [],
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

  const addAlbum = useCallback(
    (album: Omit<SavedAlbum, 'savedAt'>) =>
      setLibrary((l) => [
        ...(l ?? []),
        {
          ...album,
          savedAt: new Date(),
        },
      ]),
    [setLibrary]
  )

  return { library, addAlbum }
}
