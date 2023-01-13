import { LinksFunction, LoaderArgs, MetaFunction, json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import * as Sentry from '@sentry/browser'
import { withSentry } from '@sentry/remix'
import { useEffect } from 'react'

import { spotifyStrategy } from '~/lib/auth.server'
import type { User } from '~/lib/types/auth'
import userSettings from '~/lib/userSettings.server'

import Tracking from '~/components/Tracking'
import config from '~/config'
import RootProvider from '~/context/Root'
import env from '~/env.server'
import useTailwindTheme from '~/hooks/useTailwindTheme'

import styles from './styles/app.css'

export const meta: MetaFunction = ({ data }) => ({
  charset: 'utf-8',
  title: config.siteTitle,
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  description: config.siteDescription,
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

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming } = context
  const session = await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request)
  )
  const settings = await serverTiming.track('userSettings.get', () =>
    userSettings.get(request)
  )

  return json(
    {
      user: session?.user || (null as User | null),
      settings,
      ENV: {
        SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
        SENTRY_DSN: env.SENTRY_DSN,
        SENTRY_RELEASE: env.COMMIT_REF,
        NODE_ENV: env.NODE_ENV,
      },
    },
    {
      headers: {
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    }
  )
}

function App() {
  const data = useLoaderData<typeof loader>()
  const { isDarkMode, pallete } = useTailwindTheme()

  useEffect(() => {
    if (data.user) {
      Sentry.setUser({
        id: data.user.id,
      })
    }
  }, [data.user])

  return (
    <html lang="en" data-theme={isDarkMode ? 'dark' : 'light'}>
      <head>
        <Meta />
        <meta name="theme-color" content={pallete['base-100']} />
        <Links />
        <Tracking />
      </head>
      <body>
        <RootProvider user={data.user} settings={data.settings}>
          <Outlet />
        </RootProvider>
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
