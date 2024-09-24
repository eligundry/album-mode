import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { promiseHash } from 'remix-utils/promise'

import { spotifyStrategy } from '~/lib/auth.server'
import { getRequestContextValues } from '~/lib/context.server'
// import growthbookLib from '~/lib/growthbook.server'
import userSettings from '~/lib/userSettings.server'

import Document from '~/components/Base/Document'
import config from '~/config'
import RootProvider from '~/context/Root'

import styles from './styles/app.css?url'

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const canonicalURL = new URL(
    location.pathname + location.search,
    config.siteURL,
  )

  Object.entries(Object.fromEntries(canonicalURL.searchParams)).forEach(
    ([key]) => {
      if (!config.allowedQueryParametersInCanoncialURL.includes(key)) {
        canonicalURL.searchParams.delete(key)
      }
    },
  )

  return [
    { charset: 'utf-8' },
    {
      title: `${config.siteTitle} | The music nerd robot that wants you to listen to something new on Spotify!`,
    },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
    },
    {
      name: 'description',
      content: `${config.siteDescription} Let us recommend an album on Spotify!`,
    },
    {
      name: 'version',
      content: data?.ENV.COMMIT_REF,
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
    {
      tagName: 'link',
      rel: 'canonical',
      href: canonicalURL.toString(),
    },
  ]
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { serverTiming, env } = getRequestContextValues(request, context)

  const { session, settings } = await promiseHash({
    session: serverTiming.track('root.spotify.session', () =>
      spotifyStrategy.getSession(request),
    ),
    settings: serverTiming.track('root.userSettings.get', () =>
      userSettings.get(request),
    ),
    // gb: serverTiming.track('root.growthbook.get', () =>
    //   growthbookLib.initializeFromRequest(request),
    // ),
  })

  return json(
    {
      user: session?.user ?? null,
      settings,
      growthbook: {
        // features: gb.getFeatures(),
        // attributes: gb.getAttributes(),
        features: {},
        attributes: {},
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
    },
  )
}

function App() {
  // @ts-ignore
  const data = useLoaderData<typeof loader>()

  return (
    <Document>
      <RootProvider
        user={data.user}
        settings={data.settings}
        // @ts-ignore
        growthbook={data.growthbook}
      >
        <Outlet />
      </RootProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
    </Document>
  )
}

export default App
