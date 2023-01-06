import React from 'react'

import type { User } from '~/lib/types/auth'

const UserContext = React.createContext<User | null>(null)

export default UserContext
