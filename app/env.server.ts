// import dotenv from 'dotenv'
import { envSchema, webAppEnvSchema } from './lib/envSchema.server'

// dotenv.config()

interface Options {
  isNotWebApp?: boolean
  env?: any
}

export const getEnv = (
  { isNotWebApp, env }: Options = {
    isNotWebApp:
      process.env.GITHUB_ACTIONS === 'true' ||
      process.env.SEED_SCRIPT === 'true',
    env: process.env,
  }
) => {
  return isNotWebApp ? envSchema.safeParse(env) : webAppEnvSchema.safeParse(env)
}
