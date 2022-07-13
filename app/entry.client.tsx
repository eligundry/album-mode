import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import { hydrate } from 'react-dom'
import { useEffect } from 'react'
import * as Sentry from '@sentry/remix'

Sentry.init({
  dsn: window.ENV.SENTRY_DSN,
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      ),
    }),
  ],
})

hydrate(<RemixBrowser />, document)
