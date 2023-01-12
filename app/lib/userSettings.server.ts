import { createCookie } from '@remix-run/node'

import type { UserSettings } from '~/lib/types/userSettings'

const cookieFactory = createCookie('userSettings', {
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
})

const defaultSettings: UserSettings = {
  followArtistAutomatically: false,
  saveAlbumAutomatically: false,
}

const get = async (request: Request): Promise<UserSettings> => {
  const cookie = (await cookieFactory.parse(
    request.headers.get('Cookie')
  )) as UserSettings | null

  if (!cookie) {
    return { ...defaultSettings }
  }

  return cookie
}

const set = async (settings: UserSettings) => cookieFactory.serialize(settings)

const api = { get, set }

export default api
