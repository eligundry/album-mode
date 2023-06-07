import type {
  LibraryItem as _LibraryItem,
  SavedSearch as _SavedSearch,
} from '~/lib/database/schema.server'

export type ItemInput<T> = Omit<T, 'type' | 'savedAt' | 'id'>
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
export type LibraryItemInput = ItemInput<_LibraryItem>
export type Library = LibraryItem[]
export const defaultLibrary: Library = []

export type SavedSearch = Omit<_SavedSearch, 'type'>
export type ServerSavedSearch = ServerItem<SavedSearch>
export type LocalSavedSearch = LocalItem<SavedSearch>
export type SavedSearchInput = ItemInput<SavedSearch>
