import ServerTiming from '@eligundry/server-timing'
import '@remix-run/server-runtime'
import type { Logger } from 'winston'

import type { DatabaseClient } from '~/lib/database/index.server'

import type { Env } from '~/env.server'

declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    logger: Logger
    serverTiming: ServerTiming
    database: DatabaseClient
    env: Env
  }
}
