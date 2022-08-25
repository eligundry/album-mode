import React from 'react'

import { SpotifyUser } from '~/lib/types/spotify'

const UserContext = React.createContext<SpotifyUser | null>(null)

export default UserContext
