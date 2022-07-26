import type { BandcampDailyAlbum } from '@prisma/client'

export type SavedItem<T> = T & {
  savedAt: Date
}

export type SpotifyLibraryItem =
  | SpotifyApi.PlaylistObjectFull
  | SpotifyApi.PlaylistObjectSimplified
  | SpotifyApi.AlbumObjectFull
  | SpotifyApi.AlbumObjectSimplified

export type BandcampLibraryItem = BandcampDailyAlbum & { type: 'bandcamp' }
export type LibraryItem = SpotifyLibraryItem | BandcampLibraryItem
export type SavedLibraryItem = SavedItem<LibraryItem>
export type SavedSpotifyItem = SavedItem<SpotifyLibraryItem>
export type SavedBandcampItem = SavedItem<BandcampLibraryItem>

export interface LibraryV1 {
  version: 1
  items: SavedLibraryItem[]
}

export type Library = LibraryV1
export const CurrentLibraryVersion = 1
export const defaultLibrary: LibraryV1 = Object.freeze({
  version: 1,
  items: [],
})
