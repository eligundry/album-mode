export type LibraryItem =
  | SpotifyApi.PlaylistObjectFull
  | SpotifyApi.PlaylistObjectSimplified
  | SpotifyApi.AlbumObjectFull
  | SpotifyApi.AlbumObjectSimplified

export type SavedLibraryItem = LibraryItem & {
  savedAt: Date
}

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
