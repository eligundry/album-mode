import { useContext } from 'react'
import pick from 'lodash/pick'

import { PeerContext } from '~/context/Peer'

export default function usePeer() {
  const ctx = useContext(PeerContext)

  return pick(ctx, [
    'addBroadcastListener',
    'addConnectionListener',
    'connectToDevice',
    'sendBroadcast',
    'isSyncCapable',
    'deviceID',
  ])
}
