import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { Peer, DataConnection } from 'peerjs'
import useLocalStorage from 'react-use/lib/useLocalStorage'

import useUser from '~/hooks/useUser'

interface PeerData {
  client: Peer | null
  connections: DataConnection[]
  connectToDevice: (deviceID: string) => Promise<boolean>
}

const defaultData: PeerData = Object.freeze({
  client: null,
  connections: [],
  connectToDevice: async (deviceID) => {
    console.warn(`connectToDevice called without a context`)
  },
})

export const PeerContext = React.createContext<PeerData>(defaultData)
PeerContext.displayName = 'PeerContext'

const PeerProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const user = useUser()
  const [value, setValue] =
    useState<Pick<PeerData, 'client' | 'connections'>>(defaultData)
  const [syncing, setSyncingData] = useLocalStorage('albumModeLibrarySyncing', {
    deviceID: Math.random().toString(36).slice(2, 7),
    devices: new Array<string>(),
  })
  const { deviceID, devices } = syncing ?? {}
  const prefix = user ? `spotify-${user.id}` : null
  const peerID = prefix ? `${prefix}-${deviceID}` : null

  useEffect(() => {
    if (!peerID) {
      return
    }

    import('peerjs').then(({ Peer }) => {
      const peer = !!value.client
        ? value.client
        : new Peer(peerID, {
            debug: 3,
          })

      peer.on('open', () => {
        setValue((v) => ({
          ...v,
          client: peer,
        }))
      })

      peer.on('connection', (conn) => {
        console.log('connected!', conn)
        setValue((v) => {
          v.connections.push(conn)
          return v
        })
      })
    })

    return function cleanup() {
      if (value.client) {
        value.client.disconnect()
        value.client.destroy()
      }

      setValue((v) => ({
        ...v,
        client: null,
      }))
    }
  }, [peerID])

  useEffect(() => {
    console.log({ peer: value })
  }, [value])

  const connectToDevice = useCallback(
    async (deviceID: string) => {
      if (!value.client) {
        return false
      }

      const newConnection = value.client.connect(`${prefix}-${deviceID}`, {
        label: deviceID,
        serialization: 'json',
      })

      setValue((v) => {
        v.connections.push(newConnection)
        return v
      })

      setSyncingData((v) => {
        if (!v?.devices) {
          return v
        }

        if (!v.devices.includes(deviceID)) {
          v.devices.push(deviceID)
        }

        return v
      })

      return true
    },
    [value.client, prefix]
  )

  useEffect(() => {
    console.log(`my peerID is ${peerID}`)
  }, [peerID])

  useEffect(() => {
    window.connect = connectToDevice
  }, [connectToDevice])

  const actualValue = useMemo<PeerData>(
    () => ({
      ...value,
      connectToDevice,
    }),
    [value, connectToDevice]
  )

  return (
    <PeerContext.Provider value={actualValue}>{children}</PeerContext.Provider>
  )
}

export default PeerProvider
