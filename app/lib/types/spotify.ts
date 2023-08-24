import type { User } from '@spotify/web-api-ts-sdk'

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
  User,
  'id' | 'display_name' | 'href' | 'images' | 'uri'
>
