import { useContext } from 'react'

import SettingsContext from '~/context/Settings'

export default function useSettings() {
  return (
    useContext(SettingsContext) ?? {
      followArtistAutomatically: false,
      saveAlbumAutomatically: false,
    }
  )
}
