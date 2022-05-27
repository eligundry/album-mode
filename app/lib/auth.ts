import { createCookie } from '@remix-run/node'
import dateAddSeconds from 'date-fns/addSeconds'
import spotify, { spotifyAPI } from './spotify'

export type AuthCookie = {
  spotify:
    | { state: string }
    | {
        accessToken: string
        refreshToken: string | null
        expires: string
      }
}

const cookieFactory = createCookie('auth', {
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
})

const generateSpotifyState = () => Math.random().toString(36).slice(2, 18)

const getCookie = async (request: Request): Promise<AuthCookie> => {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const cookie = ((await cookieFactory.parse(
    cookieHeader
  )) as AuthCookie | null) ?? {
    spotify: {
      state: generateSpotifyState(),
    },
  }

  cookie.spotify = await updateSpotifyAuth(cookie?.spotify)

  return cookie
}

const updateSpotifyAuth = async (
  cookie: AuthCookie['spotify'] | null
): Promise<AuthCookie['spotify']> => {
  // User hasn't visited the site before
  if (!cookie) {
    return {
      state: generateSpotifyState(),
    }
  }

  // User hasn't logged in with Spotify but has visited the home page before
  if ('state' in cookie) {
    return cookie
  }

  // Token has expired, attempt to refresh
  if (new Date() >= new Date(cookie.expires)) {
    // We don't have a refresh token, bail
    if (!cookie.refreshToken) {
      return {
        state: generateSpotifyState(),
      }
    }

    // Attempt to refresh the access token
    const spotifyClient = spotify.getUserClient(
      cookie.accessToken,
      cookie.refreshToken
    )

    try {
      const resp = await spotifyClient.refreshAccessToken()

      return {
        accessToken: resp.body.access_token,
        refreshToken: resp.body.refresh_token ?? null,
        expires: dateAddSeconds(new Date(), resp.body.expires_in).toISOString(),
      }
    } catch (e) {
      // Couldn't refresh the token, return not logged in state
      return {
        state: generateSpotifyState(),
      }
    }
  }

  return cookie
}

const handleSpotifyLoginCallback = async (
  request: Request
): Promise<AuthCookie> => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    throw new Error('bad request: the `code` query param must be provided')
  }

  if (!state) {
    throw new Error('bad request: the `state` query param must be provided')
  }

  const cookie = (await cookieFactory.parse(
    request.headers.get('Cookie') ?? ''
  )) as AuthCookie | null

  if (!cookie) {
    throw new Error('bad request: the `auth` cookie must be sent')
  }

  if (!('state' in cookie.spotify)) {
    throw new Error('bad request: the `auth` cookie must have a `state` string')
  }

  if (cookie.spotify.state !== state) {
    throw new Error(
      'unauthorized: the `state` in the `auth` cookie does not match the `state` passed to Spotify for login'
    )
  }

  try {
    const resp = await spotifyAPI.authorizationCodeGrant(code)

    return {
      ...cookie,
      spotify: {
        accessToken: resp.body.access_token,
        refreshToken: resp.body.refresh_token,
        expires: dateAddSeconds(new Date(), resp.body.expires_in).toISOString(),
      },
    }
  } catch (e) {
    throw new Error(
      `could not exchange authorization code for access token: ${e.message}`
    )
  }
}

const api = { getCookie, cookieFactory, handleSpotifyLoginCallback }

export default api
