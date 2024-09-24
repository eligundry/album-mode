import { defineConfig } from 'drizzle-kit'

import { getEnv } from '~/env.server'

const env = getEnv()

export default defineConfig({
  dialect: 'sqlite',
  driver: 'turso',
  out: './migrations',
  schema: './app/lib/database/schema.server.ts',
  breakpoints: true,
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_AUTH_TOKEN,
  },
})
