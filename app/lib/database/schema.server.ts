import { sql } from 'drizzle-orm'
import {
  blob,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

const timestampSQL = sql`(cast(strftime('%s', 'now') as int))`

const recordKeeping = {
  id: integer('id').primaryKey(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(timestampSQL),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(timestampSQL),
}

export const reviewers = sqliteTable(
  'Reviewers',
  {
    ...recordKeeping,
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    service: text('service', { enum: ['twitter', 'publication'] }).default(
      'publication'
    ),
    metadata: blob('metadata', { mode: 'json' }).$type<{
      metaDescription?: string | null
      url?: string
      twitterUserID?: string
    }>(),
  },
  (publication) => ({
    uniqueSlug: uniqueIndex('uq_PublicationSlug').on(publication.slug),
  })
)

export type Reviewer = typeof reviewers._.model.select

export const reviewedItems = sqliteTable(
  'ReviewedItems',
  {
    ...recordKeeping,
    reviewerID: integer('reviewerID').notNull(),
    reviewURL: text('reviewURL').notNull(),
    name: text('name').notNull(),
    creator: text('creator').notNull(),
    service: text('service', { enum: ['spotify', 'bandcamp'] })
      .notNull()
      .default('spotify'),
    resolvable: integer('resolvable').notNull().$type<0 | 1>().default(1),
    metadata: blob('metadata', { mode: 'json' }).$type<{
      reviewUnresolvable?: boolean
      imageURL?: string | null
      blurb?: string
      spotify?: {
        itemType: 'album' | 'track' | 'playlist'
        itemID: string
      }
      bandcamp?: {
        url: string
        albumID: string
      }
      twitter?: {
        id: string
      }
    }>(),
  },
  (review) => ({
    uniqueReviewURL: uniqueIndex('uq_AlbumsReviewedByPublicationReviewURL').on(
      review.reviewerID,
      review.reviewURL
    ),
  })
)

export type ReviewedItem = typeof reviewedItems._.model.select

export const spotifyGenres = sqliteTable(
  'SpotifyGenres',
  {
    ...recordKeeping,
    name: text('name').notNull(),
  },
  (spotifyGenres) => ({
    uniqueSlug: uniqueIndex('uq_SpotifyGenreName').on(spotifyGenres.name),
  })
)

export type SpotifyGenre = typeof spotifyGenres._.model.select

export type SavedSearch = {
  type: 'search'
  crumbs: string[]
  path: string
}

export type LibraryItem = {
  type: 'library'
  name: string
  creator: string
  url: string
  creatorURL?: string | null
  imageURL?: string | null
  service: 'spotify' | 'bandcamp'
}

export const savedItems = sqliteTable(
  'SavedItems',
  {
    ...recordKeeping,
    deletedAt: integer('deletedAt', { mode: 'timestamp' }),
    user: text('user').notNull(),
    type: text('type', { enum: ['library', 'search', 'settings'] }),
    identifier: text('identifier').notNull(),
    metadata: blob('metadata', { mode: 'json' }).$type<
      SavedSearch | LibraryItem
    >(),
  },
  (savedItems) => ({
    uniqueSlug: uniqueIndex('uq_SavedItemsIdentifier').on(
      savedItems.user,
      savedItems.identifier,
      savedItems.type,
      savedItems.deletedAt
    ),
  })
)

export type SavedItem = typeof savedItems._.model.select
