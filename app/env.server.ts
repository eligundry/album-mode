import { envSchema, webAppEnvSchema } from './lib/envSchema.server'

const isNotWebApp =
  process.env.GITHUB_ACTIONS === 'true' || process.env.SEED_SCRIPT === 'true'

const env = isNotWebApp
  ? envSchema.parse(process.env)
  : webAppEnvSchema.parse(process.env)

export default env
