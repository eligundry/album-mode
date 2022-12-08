/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import '@remix-run/server-runtime'
import type { Logger } from 'winston'
import ServerTiming from '@eligundry/server-timing'

declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    logger: Logger
    serverTiming: ServerTiming
  }
}
