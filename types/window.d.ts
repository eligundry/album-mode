export {}

declare global {
  interface Window {
    ENV: Record<string, string | undefined> & {
      SPOTIFY_CLIENT_ID: string
      NODE_ENV: typeof process.env.NODE_ENV
    }

    dataLayer: any[]
  }
}
