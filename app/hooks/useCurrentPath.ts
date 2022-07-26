import { useContext } from 'react'

import { CurrentPathContext } from '~/context/CurrentPath'

export default function useCurrentPath() {
  return useContext(CurrentPathContext)
}
