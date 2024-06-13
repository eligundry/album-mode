import type { GetLoadContextFunction } from '@netlify/remix-adapter'
import '@remix-run/server-runtime'

type NetlifyContext = Parameters<GetLoadContextFunction>[1]

declare module '@remix-run/node' {
  interface AppLoadContext extends NetlifyContext {}
}
