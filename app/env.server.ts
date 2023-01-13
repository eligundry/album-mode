import { z } from 'zod'

const optionalForGithubActions = (input: unknown) =>
  process.env.GITHUB_ACTIONS === 'true' ? true : !!input

export const envSchema = z.object({
  APP_AWS_ACCESS_KEY_ID: z.string().refine(optionalForGithubActions),
  APP_AWS_SECRET_ACCESS_KEY: z.string().refine(optionalForGithubActions),
  AUTH_SECRETS: z
    .preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : null),
      z.array(z.string())
    )
    .refine(optionalForGithubActions),
  BASIC_AUTH_USERNAME: z.string().optional(),
  BASIC_AUTH_PASSWORD: z.string().optional(),
  CI: z.coerce.boolean().optional(),
  COMMIT_REF: z.string().optional(),
  DATABASE_URL: z.string(),
  LOGGER_EMAIL_SETTINGS: z
    .preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : null),
      z.object({
        publicKey: z.string(),
        privateKey: z.string(),
        templateID: z.string(),
        serviceID: z.string(),
      })
    )
    .optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  SENTRY_DSN: z.string().optional(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  TWITTER_APP_KEY: z.string().optional(),
  TWITTER_APP_SECRET: z.string().optional(),
  TWITTER_ACCESS_TOKEN: z.string().optional(),
  TWITTER_ACCESS_SECRET: z.string().optional(),
})

const env = envSchema.parse(process.env)

export default env
