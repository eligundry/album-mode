import React from 'react'

import { SavedSearch } from '~/lib/types/library'

import {
  SyncedLocalStorageProvider,
  syncedLocalStorageContextFactory,
} from './SyncedLocalStorage'

export const SavedSearchContext =
  syncedLocalStorageContextFactory<SavedSearch>()

SavedSearchContext.displayName = 'SavedSearchContext'

const SavedSearchesProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <SyncedLocalStorageProvider
      Context={SavedSearchContext}
      apiPath="/api/saved-search"
      localStorageKey="albumModeSavedSearchesV2"
    >
      {children}
    </SyncedLocalStorageProvider>
  )
}

export default SavedSearchesProvider
