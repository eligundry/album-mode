import ServerTiming from '@eligundry/server-timing'
import type { AppLoadContext } from '@remix-run/node'
import get from 'lodash/get'
import { v4 as uuid } from 'uuid'

import { constructRequestDatabase } from '~/lib/database/index.server'
import { constructLogger } from '~/lib/logging.server'

import { getEnv } from '~/env.server'

export const getRequestContextValues = (
  request: Request,
  context?: AppLoadContext,
) => {
  const url = new URL(request.url)
  const env = getEnv()
  const serverTiming = new ServerTiming()
  const requestLogger = constructLogger(env).child({
    requestID: context?.requestId ?? uuid(),
    path: url.pathname + (url.search ? '?' + url.search : ''),
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    country: get(context, 'geo.country.code', 'US'),
  })
  const { model } = constructRequestDatabase({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_AUTH_TOKEN,
    logger: requestLogger,
  })

  requestLogger.info(undefined)

  return {
    ...context,
    logger: requestLogger,
    serverTiming,
    database: model,
    env,
  }
}

export type RequestContextValues = ReturnType<typeof getRequestContextValues>
