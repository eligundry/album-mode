import { sql } from 'drizzle-orm'
import {
  blob,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

const recordKeeping = {
  id: integer('id').primaryKey(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
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

export const spotifyGenres = sqliteTable(
  'SpotifyGenres',
  {
    ...recordKeeping,
    name: text('name').notNull(),
  },
  (spotifyGenre) => ({
    uniqueSlug: uniqueIndex('uq_SpotifyGenreName').on(spotifyGenre.name),
  })
)
