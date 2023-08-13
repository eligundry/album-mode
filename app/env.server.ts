import dotenv from 'dotenv'

import { envSchema, webAppEnvSchema } from './lib/envSchema.server'

dotenv.config()

export const getEnv = (
  isNotWebApp = process.env.GITHUB_ACTIONS === 'true' ||
    process.env.SEED_SCRIPT === 'true',
) =>
  isNotWebApp
    ? envSchema.parse(process.env)
    : webAppEnvSchema.parse(process.env)

export type Env = ReturnType<typeof getEnv>
