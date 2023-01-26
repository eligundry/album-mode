import { useContext } from 'react'

import { UTMParametersContext } from '~/context/UTMParameters'

export default function useUTM() {
  return useContext(UTMParametersContext)
}
