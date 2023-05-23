import type { EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import { renderToString } from 'react-dom/server'

import env from '~/env.server'

Sentry.init({
  dsn: env.SENTRY_DSN,
  release: env.COMMIT_REF,
  tracesSampleRate: 1,
  integrations: [],
})

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
