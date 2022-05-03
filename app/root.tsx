import type { MetaFunction, LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import clsx from 'clsx'

import Tracking from '~/components/Tracking'
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

export default function App() {
  return (
    <html lang="en">
      <head>
        <Tracking />
        <Meta />
        <Links />
      </head>
      <body className={clsx('px-4')}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
