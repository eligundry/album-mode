import { z } from 'zod'

export const envSchema = z.object({
  APP_AWS_ACCESS_KEY_ID: z.string().default(''),
  APP_AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AUTH_SECRETS: z.preprocess(
    (val) => (typeof val === 'string' ? JSON.parse(val) : ['']),
    z.array(z.string())
  ),
  BASIC_AUTH_USERNAME: z.string().optional(),
  BASIC_AUTH_PASSWORD: z.string().optional(),
  CI: z.coerce.boolean().default(false),
  COMMIT_REF: z.string().optional(),
  DATABASE_URL: z.string(),
  LOGGER_EMAIL_SETTINGS: z
    .preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : val),
      z.object({
        publicKey: z.string(),
        privateKey: z.string(),
        templateID: z.string(),
        serviceID: z.string(),
      })
    )
    .optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  OG_API_URL: z.string().url().default('http://localhost:3001'),
  SEED_SCRIPT: z.coerce.boolean().default(false),
  SENTRY_DSN: z.string().optional(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  TWITTER_APP_KEY: z.string().optional(),
  TWITTER_APP_SECRET: z.string().optional(),
  TWITTER_ACCESS_TOKEN: z.string().optional(),
  TWITTER_ACCESS_SECRET: z.string().optional(),
})

export const webAppEnvSchema = envSchema.extend({
  APP_AWS_ACCESS_KEY_ID: z.string(),
  APP_AWS_SECRET_ACCESS_KEY: z.string(),
  AUTH_SECRETS: z.preprocess(
    (val) => (typeof val === 'string' && val ? JSON.parse(val) : null),
    z.array(z.string().min(2))
  ),
  OG_API_URL: z.string().url(),
})
