export interface SpotifyArtist {
  name: string
  id: string
  image:
    | {
        width?: number
        height?: number
        url: string
      }
    | undefined
}
