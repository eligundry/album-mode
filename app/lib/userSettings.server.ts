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

const checkboxOrBool = zfd
  .checkbox({ trueValue: 'true' })
  .default('false')
  .or(z.boolean().default(false))

export const schema = z.object({
  followArtistAutomatically: checkboxOrBool,
  saveAlbumAutomatically: checkboxOrBool,
  lastPresented: z.string().optional(),
  lastSearchTerm: z.string().optional(),
  lastSearchType: z.string().optional(),
})

const cookieFactory = createTypedCookie({ cookie, schema })

const defaultSettings = Object.freeze({
  followArtistAutomatically: false,
  saveAlbumAutomatically: false,
  lastPresented: undefined,
  lastSearchType: undefined,
  lastSearchTerm: undefined,
})

const get = async (request: Request) => {
  const cookie = await cookieFactory
    .parse(request.headers.get('Cookie') ?? '')
    .catch(() => defaultSettings)

  if (!cookie) {
    return { ...defaultSettings }
  }

  return cookie
}

type SetParameters<T> = T & {
  request: Request
}

const set = async ({ request, ...settings }: SetParameters<UserSettings>) => {
  const cookie = await get(request)
  return cookieFactory.serialize(
    { ...defaultSettings, ...cookie, ...settings },
    { maxAge: 60 * 60 * 24 * 365 },
  )
}

const setLastPresented = async ({
  request,
  lastPresented,
}: SetParameters<{ lastPresented: string | undefined }>) => {
  const [lastSearchType, lastSearchTerm] = getCurrentSearchFromRequest(request)
  const cookie = await get(request)

  return cookieFactory.serialize({
    ...defaultSettings,
    ...cookie,
    lastPresented,
    lastSearchType,
    lastSearchTerm,
  })
}

const albumSearchParams = z.object({
  artist: z.string().optional(),
  artistID: z.string().optional(),
  genre: z.string().optional(),
})

const getCurrentSearchFromRequest = (
  request: Request,
): [string, string] | [undefined, undefined] => {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/publication')) {
    return url.pathname.split('/').filter(Boolean) as [string, string]
  }

  const params = albumSearchParams.parse(url.searchParams)

  if (params.artist) {
    return ['artist', params.artist]
  } else if (params.genre) {
    return ['genre', params.genre]
  } else if (params.artistID) {
    return ['artistID', params.artistID]
  }

  return [undefined, undefined]
}

const api = {
  get,
  set,
  setLastPresented,
  getCurrentSearchFromRequest,
  defaultSettings,
  schema,
}

export default api
