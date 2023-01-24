import type { User } from '~/lib/types/auth'
import type { UserSettings } from '~/lib/types/userSettings'

import LibraryProvider from '~/context/Library'
import LoadingProvider from '~/context/Loading'
import ModalProvider from '~/context/Modal'
import SettingsContext from '~/context/Settings'
import UserContext from '~/context/User'

interface Props {
  user: User | null
  settings: UserSettings
}

const RootProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  settings,
  user,
}) => {
  return (
    <UserContext.Provider value={user}>
      <SettingsContext.Provider value={settings}>
        <LibraryProvider>
          <ModalProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </ModalProvider>
        </LibraryProvider>
      </SettingsContext.Provider>
    </UserContext.Provider>
  )
}

export default RootProvider
