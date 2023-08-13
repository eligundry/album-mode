import { useCallback, useContext } from 'react'

import { SavedSearchContext } from '~/context/SavedSearches'
import useCurrentPath from '~/hooks/useCurrentPath'

const pathsToHideSaveButton = [
  '/spotify/currently-playing',
  '/spotify/featured-playlist',
  '/spotify/library',
  '/spotify/for-you',
]

export default function useSavedSearches() {
  const path = useCurrentPath()
  const { items: searches, saveItem } = useContext(SavedSearchContext)
  const saveable = searches ? !searches.find((s) => s.path === path) : true
  const showSaveButton = !pathsToHideSaveButton.find((p) => path.startsWith(p))

  const saveSearch = useCallback(
    async (crumbs: string[]) => saveItem({ crumbs, path }),
    [path, saveItem],
  )

  return {
    searches: searches.reverse() ?? [],
    /**
     * Is the current path from `useCurrentPath` saveable?
     */
    saveable,
    /**
     * saveSearch takes an array of human readable path parts and save it to the
     * path from `useCurrentPath`.
     */
    saveSearch,
    hasSavedSearches: searches.length > 0,
    showSaveButton,
  }
}
