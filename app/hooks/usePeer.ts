import { useContext } from 'react'

import { PeerContext } from '~/context/Peer'

export default function usePeer() {
  return useContext(PeerContext)
}
