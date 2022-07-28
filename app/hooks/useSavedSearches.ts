import { useCallback } from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'

import useCurrentPath from '~/hooks/useCurrentPath'

const pathsToHideSaveButton = [
  '/spotify/currently-playing',
  '/spotify/featured-playlist',
]

interface SavedSearch {
  path: string
  crumbs: string[]
  savedAt: Date
}

interface SavedSearchData {
  version: 1
  searches: SavedSearch[]
}

const defaultState: SavedSearchData = {
  version: 1,
  searches: [],
}

export default function useSavedSearches() {
  const path = useCurrentPath()
  const [state, setState] = useLocalStorage<SavedSearchData>(
    'albumModeSavedSearches',
    defaultState,
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
  const saveable = state?.searches
    ? !state.searches.find((s) => s.path === path)
    : true
  const showSaveButton = !pathsToHideSaveButton.find((p) => path.startsWith(p))

  const saveSearch = useCallback(
    (crumbs: string[]) =>
      setState((s) => {
        let updatedState = s

        if (!updatedState) {
          updatedState = defaultState
        }

        updatedState.searches.push({
          crumbs,
          path,
          savedAt: new Date(),
        })

        return updatedState
      }),
    [setState, path]
  )

  return {
    searches: state?.searches.reverse() ?? [],
    /**
     * Is the current path from `useCurrentPath` saveable?
     */
    saveable,
    /**
     * saveSearch takes an array of human readable path parts and save it to the
     * path from `useCurrentPath`.
     */
    saveSearch,
    hasSavedSearches: !!state?.searches?.length,
    showSaveButton,
  }
}
