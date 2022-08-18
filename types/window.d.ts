export {}

declare global {
  interface Window {
    ENV: Record<string, string | undefined> & {
      SPOTIFY_CLIENT_ID: string
      SENTRY_DSN: string
      SENTRY_RELEASE: string
      NODE_ENV: typeof process.env.NODE_ENV
    }
  }
}
