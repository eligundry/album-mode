import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import LoadingProvider from '~/context/Loading'
import UserContext from '~/context/User'
import LibraryProvider from '~/context/Library'
import type { SpotifyUser } from '~/lib/types/spotify'

interface Props {
  user: SpotifyUser | null
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
    },
  },
})

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  deserialize: (data) =>
    JSON.parse(data, (key, value) => {
      if (key === 'savedAt') {
        return new Date(value)
      }

      return value
    }),
})

const RootProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  user,
}) => {
  return (
    <UserContext.Provider value={user}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <LibraryProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </LibraryProvider>
      </PersistQueryClientProvider>
    </UserContext.Provider>
  )
}

export default RootProvider
