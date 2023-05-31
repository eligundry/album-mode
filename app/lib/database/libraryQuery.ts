import { sql } from 'drizzle-orm'

import { LibraryItem, savedItems } from './schema.server'

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
    (v): LibraryItem['image'] => JSON.parse(v)
  ),
}
