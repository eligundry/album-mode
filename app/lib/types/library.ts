import type { BandcampDailyAlbum } from '@prisma/client'

export type SavedItem<T> = T & {
  savedAt: Date
}

export type SpotifyLibraryItem = (
  | SpotifyApi.PlaylistObjectFull
  | SpotifyApi.PlaylistObjectSimplified
  | SpotifyApi.AlbumObjectFull
  | SpotifyApi.AlbumObjectSimplified
) & {
  genres?: string[]
}

export type BandcampLibraryItem = BandcampDailyAlbum & { type: 'bandcamp' }
export type LibraryItem = SpotifyLibraryItem | BandcampLibraryItem
export type SavedLibraryItem = SavedItem<LibraryItem>
export type SavedSpotifyItem = SavedItem<SpotifyLibraryItem>
export type SavedBandcampItem = SavedItem<BandcampLibraryItem>

export interface LibraryV1 {
  version: 1
  items: SavedLibraryItem[]
}

export interface LibraryV2 extends Omit<LibraryV1, 'version'> {
  version: 2
  removedItemTimestamps: string[]
}

export type Library = LibraryV1 | LibraryV2
export type CurrentLibrary = LibraryV2
export const CurrentLibraryVersion = 2
export const defaultLibrary: LibraryV2 = Object.freeze({
  version: CurrentLibraryVersion,
  items: [],
  removedItemTimestamps: [],
})
