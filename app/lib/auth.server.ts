import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import { SpotifyStrategy } from 'remix-auth-spotify'

import { getEnv } from '~/env.server'

const env = getEnv()

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'authorization',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: env.AUTH_SECRETS,
    secure: true,
  },
})

export const { getSession, commitSession, destroySession } = sessionStorage

// See https://developer.spotify.com/documentation/general/guides/authorization/scopes
export const scopes = [
  'user-read-email',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-follow-modify',
  'user-top-read',
]

export const spotifyStrategy = new SpotifyStrategy(
  {
    clientID: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    callbackURL: '/spotify/callback',
    sessionStorage,
    scope: scopes.join(' '),
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => ({
    accessToken,
    refreshToken,
    expiresAt: Date.now() + extraParams.expiresIn * 1000,
    tokenType: extraParams.tokenType,
    user: {
      id: profile.__json.uri,
      email: profile.emails[0].value,
      name: profile.displayName,
      image: profile.__json.images?.[0]?.url,
    },
  }),
)

export const authenticator = new Authenticator(sessionStorage, {
  sessionKey: spotifyStrategy.sessionKey,
  sessionErrorKey: spotifyStrategy.sessionErrorKey,
})

authenticator.use(spotifyStrategy)
