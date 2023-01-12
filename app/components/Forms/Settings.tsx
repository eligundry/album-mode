import { useFetcher } from '@remix-run/react'
import clsx from 'clsx'

import { Checkbox } from '~/components/Base'
import useSettings from '~/hooks/useSettings'

interface Props {
  className?: string
}

const SettingsForm: React.FC<Props> = ({ className }) => {
  const userSettings = useSettings()
  const settingsFetcher = useFetcher()

  const updateSettings: React.ChangeEventHandler<HTMLInputElement> = (event) =>
    settingsFetcher.submit(event.target.form)

  return (
    <settingsFetcher.Form
      action="/api/settings"
      method="post"
      className={clsx(className)}
    >
      <Checkbox
        name="followArtistAutomatically"
        value="true"
        defaultChecked={userSettings.followArtistAutomatically}
        onChange={updateSettings}
      >
        Follow artists on Spotify automatically
      </Checkbox>
      <Checkbox
        name="saveAlbumAutomatically"
        value="true"
        defaultChecked={userSettings.saveAlbumAutomatically}
        onChange={updateSettings}
      >
        Save albums to library on Spotify automatically
      </Checkbox>
    </settingsFetcher.Form>
  )
}

export default SettingsForm
