import { MetaFunction, LinksFunction, json, LoaderArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'

import auth from '~/lib/auth.server'
import spotifyLib from '~/lib/spotify.server'
import Tracking from '~/components/Tracking'
import LoadingProvider from '~/context/Loading'
import UserContext from '~/context/User'
import { useDarkMode } from '~/hooks/useMediaQuery'
import { useDaisyPallete } from '~/hooks/useTailwindTheme'
import styles from './styles/app.css'
import config from '~/config'

export const meta: MetaFunction = ({ data }) => ({
  charset: 'utf-8',
  title: 'Album Mode.party 🎉',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  description: "Don't know what to listen to? Let us recommend an album!",
  version: data.ENV.SENTRY_RELEASE,
  generator: 'Remix <https://remix.run>',
})

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: styles,
  },
  {
    rel: 'icon',
    href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💿</text></svg>',
  },
  {
    rel: 'shortcut icon',
    href: '/favicon.png',
  },
]

export async function loader({ request }: LoaderArgs) {
  const authCookie = await auth.getCookie(request)
  let user = null
  console.log(authCookie)

  if (authCookie?.spotify) {
    const spotify = await spotifyLib.initializeFromRequest(request)
    user = await spotify.getUser()
    console.log(user)
  }

  return json(
    {
      user,
      ENV: {
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SENTRY_DSN: process.env.SENTRY_DSN,
        SENTRY_RELEASE: process.env.COMMIT_REF,
      },
    },
    {
      headers: {
        'Set-Cookie': await auth.cookieFactory.serialize(authCookie),
        'Cache-Control': config.cacheControl.private,
      },
    }
  )
}

function App() {
  const data = useLoaderData<typeof loader>()
  const isDarkMode = useDarkMode()
  const pallete = useDaisyPallete()

  return (
    <html lang="en" data-theme={isDarkMode ? 'dark' : 'light'}>
      <head>
        <Tracking />
        <Meta />
        <Links />
        <meta name="theme-color" content={pallete['base-100']} />
      </head>
      <body>
        <LoadingProvider>
          <UserContext.Provider value={data.user}>
            <Outlet />
          </UserContext.Provider>
        </LoadingProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default withSentry(App)
