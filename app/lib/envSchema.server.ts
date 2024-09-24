import { z } from 'zod'

export const envSchema = z.object({
  ADMIN_SPOTIFY_USERNAMES: z
    .preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : []),
      z.array(z.string()),
    )
    .default([]),
  AUTH_SECRETS: z.preprocess(
    (val) => (typeof val === 'string' ? JSON.parse(val) : ['']),
    z.array(z.string()),
  ),
  CI: z.coerce.boolean().default(false),
  COMMIT_REF: z.string().optional(),
  GROWTHBOOK_API_HOST: z.string().url().default('https://cdn.growthbook.io'),
  GROWTHBOOK_CLIENT_KEY: z.string().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  OG_API_URL: z.string().url().default('http://localhost:3001'),
  RESEND_API_KEY: z.string().optional(),
  SEED_SCRIPT: z.coerce.boolean().default(false),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_DATABASE_AUTH_TOKEN: z.string(),
  LOCAL_DATABASE_URL: z.string().url(),
})

export const webAppEnvSchema = envSchema.extend({
  AUTH_SECRETS: z.preprocess(
    (val) => (typeof val === 'string' && val ? JSON.parse(val) : null),
    z.array(z.string().min(2)),
  ),
  GROWTHBOOK_API_HOST: z.string().url().default('https://cdn.growthbook.io'),
  GROWTHBOOK_CLIENT_KEY: z.string(),
  OG_API_URL: z.string().url(),
  LOCAL_DATABASE_URL: z.never().optional().catch(undefined),
})
