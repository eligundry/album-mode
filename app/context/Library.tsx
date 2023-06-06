import React from 'react'

import { LibraryItem } from '~/lib/types/library'

import {
  SyncedLocalStorageProvider,
  syncedLocalStorageContextFactory,
} from './SyncedLocalStorage'

export const LibraryContext = syncedLocalStorageContextFactory<LibraryItem>()
LibraryContext.displayName = 'LibraryContext'

const LibraryProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <SyncedLocalStorageProvider
      Context={LibraryContext}
      apiPath="/api/library"
      localStorageKey="albumModeLibraryV2"
    >
      {children}
    </SyncedLocalStorageProvider>
  )
}

export default LibraryProvider
