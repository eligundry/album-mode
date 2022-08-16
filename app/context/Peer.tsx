import React, { useEffect, useCallback, useReducer } from 'react'
import type { Peer, DataConnection } from 'peerjs'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import produce from 'immer'

import useUser from '~/hooks/useUser'

type PeerBroadcastCallback = (data: any) => void | Promise<void>
type PeerConnectionInitializationCallback = () => any | Promise<any>

interface PeerData {
  // Private
  client: Peer | null
  connections: DataConnection[]
  connectToDevice: (deviceID: string) => Promise<boolean>
  connectionListeners: Record<string, PeerConnectionInitializationCallback>
  broadcastListeners: Record<string, PeerBroadcastCallback>
  // Public API
  deviceID: string | null
  isSyncCapable: boolean
  addConnectionListener: (
    name: string,
    callback: PeerConnectionInitializationCallback
  ) => void
  addBroadcastListener: (event: string, callback: PeerBroadcastCallback) => void
  sendBroadcast: (event: string, data: Record<string, unknown>) => void
}

const defaultData: PeerData = Object.freeze({
  // Private
  client: null,
  connections: [],
  connectToDevice: async (deviceID) => {
    console.warn(`connectToDevice called without a context`, { deviceID })
    return false
  },
  broadcastListeners: {},
  connectionListeners: {},
  // Public API
  deviceID: null,
  isSyncCapable: false,
  addConnectionListener: (event, callback) => {
    console.warn(`addConnectionListener called without a context`, {
      event,
      callback,
    })
  },
  addBroadcastListener: (event, callback) => {
    console.warn(`addBroadcastListener called without a context`, {
      event,
      callback,
    })
  },
  sendBroadcast: (event, data) => {
    console.warn(`sendBroadcast called without a context`, {
      event,
      data,
    })
  },
})

export const PeerContext = React.createContext<PeerData>(defaultData)
PeerContext.displayName = 'PeerContext'

const PeerProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [value, dispatch] = useReducer(reducer, defaultData)
  const user = useUser()
  const [syncing, setSyncingData] = useLocalStorage('albumModeLibrarySyncing', {
    deviceID: Math.random().toString(36).slice(2, 7),
    devices: new Array<string>(),
  })
  const { deviceID, devices = [] } = syncing ?? {}
  const prefix = user ? `spotify-${user.id}` : null
  const peerID = prefix ? `${prefix}-${deviceID}` : null

  /**
   * Callback that allows for connecting to other devices.
   */
  const connectToDevice = useCallback(
    async (devID: string) =>
      new Promise<boolean>((resolve, reject) => {
        if (!value.client) {
          return reject('peerjs client has not been initialized')
        }

        console.log(`connecting to ${devID}`)
        const newConnection = value.client.connect(`${prefix}-${devID}`, {
          label: deviceID,
          serialization: 'json',
        })

        newConnection.on('open', () => {
          console.log(`connected to ${devID}`)

          dispatch({
            type: 'ADD_CONNECTION',
            connection: newConnection,
          })

          setSyncingData((v) => {
            if (!v?.devices) {
              return v
            }

            if (!v.devices.includes(devID)) {
              v.devices.push(devID)
            }

            return v
          })

          newConnection.on('data', (data) => {
            if (
              typeof data?.type === 'string' &&
              value.broadcastListeners[data.type]
            ) {
              console.log('firing a callback')
              value.broadcastListeners[data.type](data.data)
            } else {
              console.log(
                'got some data from a peer that did not have a callback',
                data
              )
            }
          })

          newConnection.send({
            type: 'SEND_DEVICE_ID',
            deviceID,
          })

          Object.entries(value.connectionListeners).forEach(([name, cb]) => {
            console.log(`sending ${name} from connectToDevice`, cb())
            sendBroadcast(name, cb())
          })

          return resolve(true)
        })
      }),
    [value.client, prefix]
  )

  const addConnectionListener = useCallback<PeerData['addConnectionListener']>(
    (name, callback) => {
      dispatch({
        type: 'ADD_CONNECTION_INITIALIZATION_CALLBACK',
        name,
        callback,
      })
    },
    []
  )

  const addBroadcastListener = useCallback<PeerData['addBroadcastListener']>(
    (event, callback) => {
      dispatch({
        type: 'ADD_BROADCAST_CALLBACK',
        event,
        callback,
      })
    },
    []
  )

  const sendBroadcast = useCallback<PeerData['sendBroadcast']>(
    (event, data) => {
      const broadcast = {
        type: event,
        data,
      }

      value.connections.forEach((conn) => conn.send(broadcast))
    },
    [value.connections.length]
  )

  useEffect(() => {
    console.log(`my peerID is ${peerID}`)
  }, [peerID])

  useEffect(() => {
    window.connect = connectToDevice
  }, [connectToDevice])

  useEffect(() => {
    console.log({
      peer: value,
      connections: value.connections.map((conn) => conn.label),
    })
  }, [value, value.connections])

  /**
   * Effect that loads peerjs and connects to the default peerjs service
   */
  useEffect(() => {
    if (!peerID) {
      return
    }

    import('peerjs').then(({ Peer }) => {
      const peer = !!value.client ? value.client : new Peer(peerID)

      peer.on('open', (conn) => {
        dispatch({
          type: 'SET_CLIENT',
          client: peer,
        })
      })

      peer.on('connection', (conn) => {
        console.log('connected!', conn)
        dispatch({
          type: 'ADD_CONNECTION',
          connection: conn,
        })
      })
    })

    return function cleanup() {
      if (value.connections.length) {
        console.log('closing connections')
        value.connections.forEach((conn) => conn.close())
      }

      if (value.client) {
        value.client.disconnect()
        value.client.destroy()
      }

      dispatch({ type: 'CLEANUP' })
    }
  }, [peerID])

  /**
   * Effect that automatically connects to any saved devices.
   */
  useEffect(() => {
    if (!value.client) {
      return
    }

    const connectToSavedDevices = async () =>
      Promise.all(
        devices.map(async (devID) => {
          const alreadyConnected = value.connections.find(
            (conn) => conn.label === devID
          )

          if (alreadyConnected) {
            return
          }

          return connectToDevice(devID)
        })
      )

    connectToSavedDevices()
  }, [devices.length, value.client])

  /**
   * Effect that handles receiving data from peers.
   */
  useEffect(() => {
    if (!value.client) {
      return
    }

    value.client.on('connection', (conn) => {
      conn.on('data', (data) => {
        switch (data?.type) {
          case 'SEND_DEVICE_ID':
            setSyncingData((v) => {
              if (!v) {
                return v
              }

              v.devices = Array.from(new Set([...v.devices, data.deviceID]))
              return v
            })
            break
          default:
            if (data?.type && value.broadcastListeners[data.type]) {
              console.log('firing this callback', data)
              value.broadcastListeners[data.type](data.data)
            } else {
              console.log('got this data from a peer in the last effect', data)
            }
        }
      })
    })
  }, [value.client, value.connectionListeners])

  return (
    <PeerContext.Provider
      value={{
        ...value,
        deviceID: deviceID ?? null,
        connectToDevice,
        isSyncCapable: !!peerID,
        addBroadcastListener,
        sendBroadcast,
        addConnectionListener,
      }}
    >
      {children}
    </PeerContext.Provider>
  )
}

type PeerAction =
  | {
      type: 'SEND_DEVICE_ID'
      deviceID: string
    }
  | {
      type: 'SET_CLIENT'
      client: Peer
    }
  | {
      type: 'ADD_CONNECTION'
      connection: DataConnection
    }
  | {
      type: 'CLEANUP'
    }
  | {
      type: 'ADD_BROADCAST_CALLBACK'
      event: string
      callback: PeerBroadcastCallback
    }
  | {
      type: 'ADD_CONNECTION_INITIALIZATION_CALLBACK'
      name: string
      callback: PeerConnectionInitializationCallback
    }

const reducer = (state: PeerData, action: PeerAction) =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'SET_CLIENT':
        draft.client = action.client
        break

      case 'SEND_DEVICE_ID':
        return state

      case 'ADD_CONNECTION':
        draft.connections = state.connections.filter(
          (conn) => conn.label !== action.connection.label
        )
        draft.connections.push(action.connection)
        break

      case 'CLEANUP':
        draft.connections = []
        draft.client = null
        break

      case 'ADD_BROADCAST_CALLBACK':
        draft.broadcastListeners[action.event] = action.callback
        break

      case 'ADD_CONNECTION_INITIALIZATION_CALLBACK':
        draft.connectionListeners[action.name] = action.callback
        break
    }
  })

export default PeerProvider
