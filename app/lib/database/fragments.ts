import { sql } from 'drizzle-orm'

import { LibraryItem, SavedSearch, savedItems } from './schema.server'

export const librarySelectColumns = {
  id: savedItems.id,
  savedAt: savedItems.createdAt,
  service: sql<
    'spotify' | 'bandcamp'
  >`json_extract(${savedItems.metadata}, '$.service')`,
  name: sql<string>`json_extract(${savedItems.metadata}, '$.name')`,
  creator: sql<
    string | null
  >`json_extract(${savedItems.metadata}, '$.creator')`,
  url: sql<string>`json_extract(${savedItems.metadata}, '$.url')`,
  creatorURL: sql<
    string | null
  >`json_extract(${savedItems.metadata}, '$.creatorURL')`,
  image: sql`json_extract(${savedItems.metadata}, '$.image')`.mapWith(
    (v): LibraryItem['image'] => JSON.parse(v),
  ),
}

export const savedSearchSelectColumns = {
  id: savedItems.id,
  savedAt: savedItems.createdAt,
  crumbs: sql`json_extract(${savedItems.metadata}, '$.crumbs')`.mapWith(
    (v): SavedSearch['crumbs'] => JSON.parse(v),
  ),
  path: sql<string>`json_extract(${savedItems.metadata}, '$.path')`,
}
