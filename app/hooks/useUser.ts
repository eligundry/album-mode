import { useContext } from 'react'

import { UserContext } from '~/context/User'

export default function useUser() {
  return useContext(UserContext)
}
