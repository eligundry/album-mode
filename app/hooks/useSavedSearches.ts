import { useCallback } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'

import useCurrentPath from '~/hooks/useCurrentPath'

export default function useSavedSearches() {
  const path = useCurrentPath()
  const [searches, setSearches] = useLocalStorage<Record<string, string[]>>(
    'albumModeSavedSearches',
    {}
  )
  const saveable = !searches?.[path]

  const saveSearch = useCallback(
    (parts: string[]) =>
      setSearches((s) => ({
        ...s,
        [path]: parts,
      })),
    [setSearches, path]
  )

  return {
    searches,
    /**
     * Is the current path from `useCurrentPath` saveable?
     */
    saveable,
    /**
     * saveSearch takes an array of human readable path parts and save it to the
     * path from `useCurrentPath`.
     */
    saveSearch,
  }
}
