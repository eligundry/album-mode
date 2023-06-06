import type {
  LibraryItem as _LibraryItem,
  SavedSearch as _SavedSearch,
} from '~/lib/database/schema.server'

export type ItemInput<T> = T
export type ServerItem<T> = ItemInput<T> & {
  id: number
  savedAt: Date
}
export type LocalItem<T> = ItemInput<T> & {
  savedAt: Date
}

export type ServerLibraryItem = ServerItem<_LibraryItem>
export type LocalLibraryItem = LocalItem<_LibraryItem>
export type LibraryItem = ServerLibraryItem | LocalLibraryItem
export type Library = LibraryItem[]
export const defaultLibrary: Library = []

export type ServerSavedSearch = ServerItem<_SavedSearch>
export type LocalSavedSearch = LocalItem<_SavedSearch>
export type SavedSearchInput = ItemInput<_SavedSearch>
export type SavedSearch = ServerSavedSearch | LocalSavedSearch
