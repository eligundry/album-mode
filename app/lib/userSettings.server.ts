import { createCookie } from '@remix-run/node'
import { createTypedCookie } from 'remix-utils'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import type { UserSettings } from '~/lib/types/userSettings'

const cookie = createCookie('userSettings', {
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
})

export const settingsSchema = z.object({
  followArtistAutomatically: zfd
    .checkbox({ trueValue: 'true' })
    .default('false')
    .or(z.boolean().default(false)),
  saveAlbumAutomatically: zfd
    .checkbox({ trueValue: 'true' })
    .default('false')
    .or(z.boolean().default(false)),
  lastPresented: z.string().optional(),
  lastSearchType: z.string().optional(),
})

const cookieFactory = createTypedCookie({ cookie, schema: settingsSchema })

const defaultSettings = {
  followArtistAutomatically: false,
  saveAlbumAutomatically: false,
  lastPresented: undefined,
  lastSearchType: undefined,
}

const get = async (request: Request) => {
  const cookie = await cookieFactory.parse(request.headers.get('Cookie'))

  if (!cookie) {
    return { ...defaultSettings }
  }

  return cookie
}

type SetParameters<T> = T & {
  request: Request
}

const set = async ({ request, ...settings }: SetParameters<UserSettings>) => {
  const cookie = await cookieFactory.parse(request.headers.get('Cookie'))
  return cookieFactory.serialize({ ...defaultSettings, ...cookie, ...settings })
}

const setLastPresented = async ({
  request,
  lastPresented,
}: SetParameters<{ lastPresented: string | undefined }>) => {
  const currentQueryParam = getCurrentSearchTypeFromRequest(request)
  const cookie = await cookieFactory.parse(request.headers.get('Cookie'))

  return cookieFactory.serialize({
    ...defaultSettings,
    ...cookie,
    lastPresented,
    lastSearchType: currentQueryParam,
  })
}

const getCurrentSearchTypeFromRequest = (
  request: Request
): string | undefined => {
  const url = new URL(request.url)
  const params = url.searchParams

  if (params.get('artist')) {
    return 'artist'
  } else if (params.get('genre')) {
    return 'genre'
  } else if (params.get('artistID')) {
    return 'artistID'
  } else if (url.pathname.startsWith('/publication')) {
    return 'publication'
  }

  return undefined
}

const api = { get, set, setLastPresented, getCurrentSearchTypeFromRequest }

export default api
