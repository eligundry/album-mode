import { createRequestHandler } from '@remix-run/netlify'
import * as build from '@remix-run/dev/server-build'
import ServerTiming from '@eligundry/server-timing'
import logger from './app/lib/logging.server'

/**
 * @type {import('@remix-run/netlify').GetLoadContextFunction}
 */
function getLoadContext(event, context) {
  const serverTiming = new ServerTiming()
  const requestLogger = logger.child({
    requestID: context.awsRequestId,
    path: event.path + (event.rawQuery ? '?' + event.rawQuery : ''),
    method: event.httpMethod,
  })

  requestLogger.info(undefined)

  return {
    logger: requestLogger,
    serverTiming,
  }
}

export const handler = createRequestHandler({
  build,
  getLoadContext,
  mode: process.env.NODE_ENV,
})
