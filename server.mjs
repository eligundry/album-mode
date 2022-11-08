import { createRequestHandler } from '@remix-run/netlify'
import * as build from '@remix-run/dev/server-build'

/**
 * @type {import('@remix-run/netlify').GetLoadContextFunction}
 */
function getLoadContext(event, context) {
  return {}
}

export const handler = createRequestHandler({
  build,
  getLoadContext,
  mode: process.env.NODE_ENV,
})
