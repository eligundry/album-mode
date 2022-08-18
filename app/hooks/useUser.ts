import { useContext } from 'react'
import UserContext, { User } from '~/context/User'

export default function useUser(): User | null {
  return useContext(UserContext)
}
