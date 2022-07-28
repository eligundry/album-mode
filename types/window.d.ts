export {}

declare global {
  interface Window {
    ENV: Record<string, string | undefined> & {
      SPOTIFY_CLIENT_ID: string
    }
  }
}
