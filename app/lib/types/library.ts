import type { LibraryItem as _LibraryItem } from '~/lib/database/schema.server'

export type ServerLibraryItem = Omit<_LibraryItem, 'type'> & {
  id: number
  savedAt: Date
}
export type LocalLibraryItem = Omit<ServerLibraryItem, 'id'>
export type LibraryItem = ServerLibraryItem | LocalLibraryItem
export type Library = LibraryItem[]
export const defaultLibrary: Library = []
