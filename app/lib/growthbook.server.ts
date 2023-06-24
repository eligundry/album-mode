import { GrowthBook, setPolyfills } from '@growthbook/growthbook'
import { detect } from 'detect-browser'

import { spotifyStrategy } from '~/lib/auth.server'

let _cache: Record<string, any> = {}

setPolyfills({
  localStorage: {
    getItem: (key: string) => _cache[key] ?? null,
    setItem: (key: string, value: string) => {
      _cache[key] = value
    },
  },
})

const initializeFromRequest = async (req: Request) => {
  const gb = new GrowthBook({
    apiHost: process.env.GROWTHBOOK_API_HOST,
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
    enableDevMode: true,
  })
  const featuresPromise = gb.loadFeatures()
  let attributes: Record<string, string | number | boolean> = {
    loggedIn: false,
  }

  // Netlify will set this header for us based upon geoip
  const country = req.headers.get('x-country')

  if (country) {
    attributes = { ...attributes, country }
  }

  // Detect if logged in
  const session = await spotifyStrategy.getSession(req)

  if (session && session.user) {
    attributes = {
      ...attributes,
      loggedIn: true,
      id: session.user.id,
    }
  }

  // Get the Google Client ID from the cookie. This will serve as the device ID
  // and how we will do much of our hashing of assignments.
  const cookieStr = req.headers.get('cookie')

  if (cookieStr) {
    const googleClientID = cookieStr
      .match(/_ga=(.+?);/)?.[1]
      .split('.')
      .slice(-2)
      .join('.')

    if (googleClientID) {
      attributes = { ...attributes, googleClientID }
    }
  }

  // This is gross and not how you should detect browsers BUT if you want
  // somewhat accurate assignments on first paint, this is the way.
  const browser = detect(req.headers.get('user-agent') ?? '')

  if (browser) {
    attributes = {
      ...attributes,
      browser: browser.name,
      bot: browser.type.startsWith('bot'),
      mobile: browser.os === 'iOS' || browser.os === 'Android OS',
    }
  }

  // Get the first language from the accept-language header
  const language = req.headers.get('accept-language')?.split(',')?.at(0)

  if (language) {
    attributes = { ...attributes, language }
  }

  gb.setAttributes(attributes)
  await featuresPromise

  return gb
}

const api = { initializeFromRequest }

export default api
