import { setupServer } from 'msw/node'

export const server = setupServer()

server.listen({ onUnhandledRequest: 'error' })

process.on('SIGINT', () => server.close()) // kill(2) Ctrl-C
process.on('SIGTERM', () => server.close()) // kill(15) default
