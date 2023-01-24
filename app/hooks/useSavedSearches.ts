import { useLocalStorageValue as useLocalStorage } from '@react-hookz/web'
import { useCallback } from 'react'

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
  const { value: state, set: setState } = useLocalStorage<SavedSearchData>(
    'albumModeSavedSearches',
    {
      defaultValue: defaultState,
      initializeWithValue: true,
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
      stringify: (value) => JSON.stringify(value),
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
