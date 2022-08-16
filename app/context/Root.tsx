import LoadingProvider from '~/context/Loading'
import UserContext from '~/context/User'
import PeerProvider from '~/context/Peer'
import LibraryProvider from '~/context/Library'
import type { SpotifyUser } from '~/lib/types/spotify'

interface Props {
  user: SpotifyUser | null
}

const RootProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  user,
}) => {
  return (
    <UserContext.Provider value={user}>
      <PeerProvider>
        <LibraryProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </LibraryProvider>
      </PeerProvider>
    </UserContext.Provider>
  )
}

export default RootProvider
