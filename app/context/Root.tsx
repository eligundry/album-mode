import type { User } from '~/lib/types/auth'

import LibraryProvider from '~/context/Library'
import LoadingProvider from '~/context/Loading'
import UserContext from '~/context/User'

interface Props {
  user: User | null
}

const RootProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  user,
}) => {
  return (
    <UserContext.Provider value={user}>
      <LibraryProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </LibraryProvider>
    </UserContext.Provider>
  )
}

export default RootProvider
