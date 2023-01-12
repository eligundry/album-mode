import React from 'react'

import type { UserSettings } from '~/lib/types/userSettings'

const SettingsContext = React.createContext<UserSettings | null>({
  followArtistAutomatically: false,
  saveAlbumAutomatically: false,
})
SettingsContext.displayName = 'SettingsContext'

export default SettingsContext
