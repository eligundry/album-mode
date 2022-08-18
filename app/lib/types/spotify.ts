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

export type SpotifyUser = Pick<
  SpotifyApi.CurrentUsersProfileResponse,
  'id' | 'display_name' | 'href' | 'images' | 'uri'
>
