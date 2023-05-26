import ServerTiming from '@eligundry/server-timing'
import * as build from '@remix-run/dev/server-build'
import { createRequestHandler } from '@remix-run/netlify'
import { installGlobals } from '@remix-run/node'

import { getEnv } from './app/env.server'
import { constructRequestDatabase } from './app/lib/database/index.server'
import { constructLogger } from './app/lib/logging.server'

installGlobals()

/**
 * @type {import('@remix-run/netlify').GetLoadContextFunction}
 */
async function getLoadContext(event, context) {
  const env = getEnv()
  const serverTiming = new ServerTiming()
  const requestLogger = constructLogger().child({
    requestID: context.awsRequestId,
    path: event.path + (event.rawQuery ? '?' + event.rawQuery : ''),
    method: event.httpMethod,
    userAgent: event.headers['user-agent'],
  })
  const { model } = constructRequestDatabase({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_AUTH_TOKEN,
    logger: requestLogger,
  })

  requestLogger.info(undefined)

  return {
    logger: requestLogger,
    serverTiming,
    database: model,
    env,
  }
}

export const handler = createRequestHandler({
  build,
  getLoadContext,
  mode: process.env.NODE_ENV,
})
