import { createCookie } from '@remix-run/node'

export type LastPresentedCookie = {
  path: string
  id: string
} | null

const cookieFactory = createCookie('lastPresented', {
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
})

const getCookie = async (
  request: Request
): Promise<LastPresentedCookie | null> => {
  const cookie = (await cookieFactory.parse(
    request.headers.get('Cookie')
  )) as LastPresentedCookie | null

  return cookie
}

const set = (request: Request, id: string) => {
  const url = new URL(request.url)
  const path = url.pathname + url.search
  const data: LastPresentedCookie = {
    path,
    id,
  }

  return cookieFactory.serialize(data)
}

const clearCookie = async () => {
  return cookieFactory.serialize(null)
}

const getLastPresentedID = async (request: Request): Promise<string | null> => {
  const url = new URL(request.url)
  const path = url.pathname + url.search
  const cookie = await getCookie(request)

  if (cookie && 'path' in cookie && cookie.path === path) {
    return cookie.id
  }

  return null
}

const api = { getCookie, clearCookie, cookieFactory, set, getLastPresentedID }

export default api
