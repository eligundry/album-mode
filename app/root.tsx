import { LoaderArgs, V2_MetaFunction, json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react'
import { useMemo } from 'react'
import { promiseHash } from 'remix-utils'

import { spotifyStrategy } from '~/lib/auth.server'
import growthbookLib from '~/lib/growthbook.server'
import type { User } from '~/lib/types/auth'
import userSettings from '~/lib/userSettings.server'

import Tracking from '~/components/Tracking'
import config from '~/config'
import RootProvider from '~/context/Root'
import useTailwindTheme from '~/hooks/useTailwindTheme'

import styles from './styles/app.css'

export const meta: V2_MetaFunction = ({ data }) => [
  { charset: 'utf-8' },
  {
    title: `${config.siteTitle} | The music nerd robot that wants you to listen to something new on Spotify!`,
  },
  {
    name: 'viewport',
    content:
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  },
  {
    name: 'description',
    content: `${config.siteDescription} Let us recommend an album on Spotify!`,
  },
  {
    name: 'version',
    content: data.ENV.COMMIT_REF,
  },
  {
    name: 'generator',
    content: 'Remix <https://remix.run>',
  },
  {
    tagName: 'link',
    rel: 'stylesheet',
    href: styles,
  },
  {
    tagName: 'link',
    rel: 'icon',
    href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💿</text></svg>',
  },
  {
    tagName: 'link',
    rel: 'shortcut icon',
    href: '/favicon.png',
  },
]

export async function loader({
  request,
  context: { serverTiming, env },
}: LoaderArgs) {
  const { session, settings, gb } = await promiseHash({
    session: serverTiming.track('root.spotify.session', () =>
      spotifyStrategy.getSession(request)
    ),
    settings: serverTiming.track('root.userSettings.get', () =>
      userSettings.get(request)
    ),
    gb: serverTiming.track('root.growthbook.get', () =>
      growthbookLib.initializeFromRequest(request)
    ),
  })

  return json(
    {
      user: session?.user || (null as User | null),
      settings,
      growthbook: {
        features: gb.getFeatures(),
        attributes: gb.getAttributes(),
      },
      ENV: {
        SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
        COMMIT_REF: env.COMMIT_REF,
        NODE_ENV: env.NODE_ENV,
        GROWTHBOOK_API_HOST: env.GROWTHBOOK_API_HOST,
        GROWTHBOOK_CLIENT_KEY: env.GROWTHBOOK_CLIENT_KEY,
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
  const { pathname, search } = useLocation()
  const data = useLoaderData<typeof loader>()
  const { isDarkMode, pallete } = useTailwindTheme()
  const googleTagManagerDebug = useMemo(
    () => new URLSearchParams(search.substring(1)).has('gtm_debug'),
    []
  )
  const canonicalURL = useMemo(() => {
    const url = new URL(pathname + search, config.siteURL)

    Object.entries(Object.fromEntries(url.searchParams)).forEach(([key]) => {
      if (!config.allowedQueryParametersInCanoncialURL.includes(key)) {
        url.searchParams.delete(key)
      }
    })

    return url.toString()
  }, [pathname, search])

  return (
    <html lang="en" data-theme={isDarkMode ? 'dark' : 'light'}>
      <head>
        <Meta />
        <meta name="theme-color" content={pallete['base-100']} />
        <link rel="canonical" href={canonicalURL} />
        <Links />
        <Tracking disablePartytown={googleTagManagerDebug} />
      </head>
      <body>
        <RootProvider
          user={data.user}
          settings={data.settings}
          // @ts-ignore
          growthbook={data.growthbook}
        >
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

export default App
