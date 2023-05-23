import ServerTiming from '@eligundry/server-timing'
import * as build from '@remix-run/dev/server-build'
import { createRequestHandler } from '@remix-run/netlify'

import env from './app/env.server'
import { DatabaseClient } from './app/lib/database/index.server'
import logger from './app/lib/logging.server'

/**
 * @type {import('@remix-run/netlify').GetLoadContextFunction}
 */
async function getLoadContext(event, context) {
  const serverTiming = new ServerTiming()
  const requestLogger = logger.child({
    requestID: context.awsRequestId,
    path: event.path + (event.rawQuery ? '?' + event.rawQuery : ''),
    method: event.httpMethod,
    userAgent: event.headers['user-agent'],
  })
  const database = new DatabaseClient({
    path: 'data.db',
    logger: requestLogger,
  })

  // requestLogger.info(undefined)

  return {
    logger: requestLogger,
    serverTiming,
    database,
  }
}

export const handler = createRequestHandler({
  build,
  getLoadContext,
  mode: env.NODE_ENV,
})
