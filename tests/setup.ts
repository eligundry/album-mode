import { installGlobals } from '@remix-run/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

// MSW API mocks
import { server } from './mocks/server'

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals()

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())
