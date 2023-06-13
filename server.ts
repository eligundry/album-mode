import ServerTiming from '@eligundry/server-timing'
import {
  GetLoadContextFunction,
  createPagesFunctionHandler,
} from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'

import { getEnv } from './app/env.server'
import { constructRequestDatabase } from './app/lib/database/index.server'
import { constructLogger } from './app/lib/logging.server'

installGlobals()

const getLoadContext: GetLoadContextFunction = async (context) => {
  const env = getEnv()
  const serverTiming = new ServerTiming()
  const requestLogger = constructLogger().child({
    requestID: context.request.headers.get('cf-ray'),
    url: context.request.url,
    method: context.request.method,
    userAgent: context.request.headers.get('user-agent'),
  })
  const { model } = constructRequestDatabase({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_AUTH_TOKEN,
    logger: requestLogger,
  })
  console.log('hell0')

  requestLogger.info(undefined)

  return {
    logger: requestLogger,
    serverTiming,
    database: model,
    env,
    ...context.env,
  }
}

export const handler = createPagesFunctionHandler({
  build,
  getLoadContext,
  mode: process.env.NODE_ENV,
})
