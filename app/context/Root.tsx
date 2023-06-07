import type { GrowthBookSSRData } from '@growthbook/growthbook-react'

import type { User } from '~/lib/types/auth'
import type { UserSettings } from '~/lib/types/userSettings'

import GrowthBookProvider from '~/context/GrowthBook'
import LibraryProvider from '~/context/Library'
import LoadingProvider from '~/context/Loading'
import ModalProvider from '~/context/Modal'
import SavedSearchesProvider from '~/context/SavedSearches'
import SettingsContext from '~/context/Settings'
import UTMParametersProvider from '~/context/UTMParameters'
import UserProvider from '~/context/User'

interface Props {
  user: User | null
  settings: UserSettings
  growthbook: GrowthBookSSRData
}

const RootProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  growthbook,
  settings,
  user,
}) => {
  return (
    <UserProvider user={user}>
      <SettingsContext.Provider value={settings}>
        <GrowthBookProvider
          features={growthbook.features}
          attributes={growthbook.attributes}
        >
          <LibraryProvider>
            <SavedSearchesProvider>
              <UTMParametersProvider>
                <ModalProvider>
                  <LoadingProvider>{children}</LoadingProvider>
                </ModalProvider>
              </UTMParametersProvider>
            </SavedSearchesProvider>
          </LibraryProvider>
        </GrowthBookProvider>
      </SettingsContext.Provider>
    </UserProvider>
  )
}

export default RootProvider
