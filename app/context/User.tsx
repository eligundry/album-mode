import * as Sentry from '@sentry/browser'
import React, { useEffect } from 'react'

import type { User } from '~/lib/types/auth'

import useGTM from '~/hooks/useGTM'

export const UserContext = React.createContext<User | null>(null)
UserContext.displayName = 'UserContext'

const UserProvider: React.FC<
  React.PropsWithChildren<{ user: User | null }>
> = ({ user, children }) => {
  const sendEvent = useGTM()

  useEffect(() => {
    if (user?.id) {
      sendEvent({
        user_id: user.id,
      })

      Sentry.setUser({
        id: user.id,
      })
    }
  }, [user?.id, sendEvent])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export default UserProvider
