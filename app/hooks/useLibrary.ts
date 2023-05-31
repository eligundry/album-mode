import { useContext } from 'react'

import { LibraryItem, LocalLibraryItem } from '~/lib/types/library'

import { LibraryContext } from '~/context/Library'

export type { LibraryItem, LocalLibraryItem }

/**
 * useAlbumLibrary is a hook that stores the albums the user gives a thumbs up
 * to in the browser's local storage.
 */
export default function useLibrary() {
  return useContext(LibraryContext)
}
