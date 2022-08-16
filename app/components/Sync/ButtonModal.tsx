import { useCallback, useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

import usePeer from '~/hooks/usePeer'
import {
  LabelButton,
  Input,
  Typography,
  Heading,
  Button,
} from '~/components/Base'
import Modal from '~/components/Base/Modal'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'

const SyncButtonModal: React.FC = () => {
  const labelRef = useRef<HTMLLabelElement>(null)
  const [connecting, setConnecting] = useState(false)
  const { isSyncCapable, connectToDevice, deviceID, addConnectionListener } =
    usePeer()
  const name = 'setup-sync-modal'

  const closeModal = useCallback(() => labelRef?.current?.click(), [])

  const addDevice = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      setConnecting(true)
      e.preventDefault()

      const deviceID = new FormData(e.target).get('deviceID')

      if (!deviceID || typeof deviceID !== 'string') {
        return
      }

      await connectToDevice(deviceID)
      console.log('connected in the callback!')

      setConnecting(false)
      closeModal()
    },
    [connectToDevice]
  )

  if (!isSyncCapable) {
    return (
      <SpotifyLoginButton>
        Login to Spotify to enable syncing
      </SpotifyLoginButton>
    )
  }

  useEffect(() => {
    addConnectionListener('SEND_DEVICE_ID', () => {
      closeModal()
      setConnecting(false)
      return {}
    })
  }, [addConnectionListener, closeModal])

  return (
    <>
      <LabelButton htmlFor={name} ref={labelRef}>
        Setup Sync
      </LabelButton>
      <Modal
        name={name}
        closeable
        className={clsx('text-center', 'flex', 'flex-col', 'gap-2')}
      >
        <Heading level="h1">{deviceID}</Heading>
        <Typography>
          Open this page on the device you would like to link, open this modal,
          and enter the code above.
        </Typography>
        <form
          onSubmit={addDevice}
          className={clsx('flex', 'flex-col', 'gap-2')}
        >
          <Input
            name="deviceID"
            placeholder="Enter code shown on the other device"
            required
          />
          <Button type="submit" disabled={connecting} loading={connecting}>
            {!connecting ? 'Submit' : 'Connecting'}
          </Button>
        </form>
      </Modal>
    </>
  )
}

export default SyncButtonModal
