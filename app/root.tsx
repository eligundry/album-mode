import {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  json,
} from '@remix-run/node'
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

import Tracking from '~/components/Tracking'
import { useDarkMode } from '~/hooks/useMediaQuery'
import styles from './styles/app.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Album Mode.party 🎉',
  viewport: 'width=device-width,initial-scale=1',
  description: "Don't know what to listen to? Let us recommend an album!",
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

export const loader: LoaderFunction = async () =>
  json({
    ENV: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    },
  })

export default function App() {
  const data = useLoaderData()
  const isDarkMode = useDarkMode()

  return (
    <html lang="en">
      <head>
        <Tracking />
        <Meta />
        <Links />
        <meta name="theme-color" content={isDarkMode ? '#000' : '#fff'} />
      </head>
      <body className={clsx('px-4', 'dark:bg-black', 'dark:text-white')}>
        <Outlet />
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
