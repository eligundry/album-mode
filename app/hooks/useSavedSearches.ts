import { useCallback } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'

import useCurrentPath from '~/hooks/useCurrentPath'

const pathsToHideSaveButton = [
  '/spotify/currently-playing',
  '/spotify/featured-playlist',
]

export default function useSavedSearches() {
  const path = useCurrentPath()
  const [searches, setSearches] = useLocalStorage<Record<string, string[]>>(
    'albumModeSavedSearches',
    {}
  )
  const saveable = !searches?.[path]
  const showSaveButton = !pathsToHideSaveButton.find((p) => path.startsWith(p))

  const saveSearch = useCallback(
    (crumbs: string[]) =>
      setSearches((s) => ({
        ...s,
        [path]: crumbs,
      })),
    [setSearches, path]
  )

  return {
    searches: searches ?? {},
    /**
     * Is the current path from `useCurrentPath` saveable?
     */
    saveable,
    /**
     * saveSearch takes an array of human readable path parts and save it to the
     * path from `useCurrentPath`.
     */
    saveSearch,
    hasSavedSearches: searches && Object.entries(searches).length > 0,
    showSaveButton,
  }
}
