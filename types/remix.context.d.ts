import ServerTiming from '@eligundry/server-timing'
import '@remix-run/server-runtime'
import type { Logger } from 'winston'

declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    logger: Logger
    serverTiming: ServerTiming
  }
}
