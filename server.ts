import ServerTiming from '@eligundry/server-timing'
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'

// import { getEnv } from './app/env.server'
import { constructRequestDatabase } from './app/lib/database/index.server'
import { constructLogger } from './app/lib/logging.server'

export const onRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: async (context) => {
    // const env = getEnv({
    //   isNotWebApp: true,
    //   env: context.env,
    // })
    const serverTiming = new ServerTiming()
    const requestLogger = constructLogger().child({
      requestID: context.request.headers.get('cf-ray'),
      url: context.request.url,
      method: context.request.method,
      userAgent: context.request.headers.get('user-agent'),
    })
    const { model } = constructRequestDatabase({
      url: context.env.TURSO_DATABASE_URL,
      authToken: context.env.TURSO_DATABASE_AUTH_TOKEN,
      logger: requestLogger,
    })

    requestLogger.info(undefined)

    return {
      logger: requestLogger,
      serverTiming,
      database: model,
      env: context.env,
    }
  },
})
