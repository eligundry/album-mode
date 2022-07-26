import { MetaFunction, LinksFunction, LoaderArgs, json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import { withSentry } from '@sentry/remix'

import Tracking from '~/components/Tracking'
import { useDarkMode } from '~/hooks/useMediaQuery'
import { useDaisyPallete } from '~/hooks/useTailwindTheme'
import CurrentPathProvider from '~/context/CurrentPath'
import styles from './styles/app.css'

export const meta: MetaFunction = ({ data }) => ({
  charset: 'utf-8',
  title: 'Album Mode.party 🎉',
  viewport: 'width=device-width,initial-scale=1',
  description: "Don't know what to listen to? Let us recommend an album!",
  version: data.ENV.SENTRY_RELEASE,
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
]

export async function loader(ctx: LoaderArgs) {
  const currentURL = new URL(ctx.request.url)
  const currentPath = currentURL.pathname + currentURL.search

  return json({
    currentPath,
    ENV: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_RELEASE: process.env.COMMIT_REF,
    },
  })
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
      <body className={clsx('px-4')}>
        <CurrentPathProvider initialPath={data.currentPath}>
          <Outlet />
          <ScrollRestoration />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
            }}
          />
          <Scripts />
          <LiveReload />
        </CurrentPathProvider>
      </body>
    </html>
  )
}

export default withSentry(App)
