import { useContext } from 'react'

import { LoadingContext } from '~/context/Loading'

export default function useLoading() {
  return useContext(LoadingContext)
}
