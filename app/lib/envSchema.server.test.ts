import omit from 'lodash/omit'
import { describe, expect, it } from 'vitest'

import { envSchema, webAppEnvSchema } from './envSchema.server'

const baseEnv = {
  AUTH_SECRETS: '["xxx", "yyy"]',
  BASIC_AUTH_USERNAME: 'username',
  BASIC_AUTH_PASSWORD: 'password',
  CI: 'false',
  COMMIT_REF: 'xxx',
  GROWTHBOOK_API_HOST: 'https://example.com',
  GROWTHBOOK_CLIENT_KEY: 'xxx',
  LOGGER_EMAIL_SETTINGS: {
    publicKey: 'xxx',
    privateKey: 'xxx',
    templateID: 'xxx',
    serviceID: 'xxx',
  },
  NODE_ENV: 'production',
  OG_API_URL: 'http://localhost:3001',
  SEED_SCRIPT: 'false',
  SPOTIFY_CLIENT_ID: 'xxx',
  SPOTIFY_CLIENT_SECRET: 'yyy',
  TURSO_DATABASE_URL: 'libsql://database.turso.io',
  TURSO_DATABASE_AUTH_TOKEN: 'xxx',
  LOCAL_DATABASE_URL: 'file:.data/local.db',
}

describe('envSchema', () => {
  it('should work for shell scripts', async () => {
    const result = envSchema.safeParse(
      omit({ ...baseEnv, SEED_SCRIPT: 'true', CI: 'true' }, [
        'AUTH_SECRETS',
        'BASIC_AUTH_PASSWORD',
        'BASIC_AUTH_USERNAME',
        'COMMIT_REF',
        'GROWTHBOOK_API_HOST',
        'GROWTHBOOK_CLIENT_KEY',
        'LOGGER_EMAIL_SETTINGS',
        'OG_API_URL',
      ]),
    )
    expect(result.success).toBe(true)
  })

  it('should work for web apps', async () => {
    const result = webAppEnvSchema.safeParse(baseEnv)
    expect(result.success).toBe(true)
  })

  const requiredKeys = [
    'AUTH_SECRETS',
    'TURSO_DATABASE_URL',
    'TURSO_DATABASE_AUTH_TOKEN',
    'OG_API_URL',
  ]

  requiredKeys.forEach((key) =>
    it(`should fail if ${key} is not present in the web app env`, async () => {
      const result = webAppEnvSchema.safeParse(omit(baseEnv, [key]))
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].path).toMatchObject([key])
      }
    }),
  )
})
