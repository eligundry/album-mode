import ServerTiming from '@eligundry/server-timing'
import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'
import { createRequestHandler } from '@remix-run/vercel'

import { getEnv } from './app/env.server'
import { constructRequestDatabase } from './app/lib/database/index.server'
import { constructLogger } from './app/lib/logging.server'

installGlobals()

console.log('wtf')

export default createRequestHandler({
  build,
  getLoadContext: async (req, resp) => {
    console.log('hello')
    const env = getEnv()
    const serverTiming = new ServerTiming()
    const requestLogger = constructLogger().child({
      // requestID: context.awsRequestId,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    })
    const { model } = constructRequestDatabase({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_DATABASE_AUTH_TOKEN,
      logger: requestLogger,
    })

    requestLogger.info(undefined)

    console.log({ env, serverTiming, requestLogger, model })

    return {
      logger: requestLogger,
      serverTiming,
      database: model,
      env,
    }
  },
  mode: process.env.NODE_ENV,
})
