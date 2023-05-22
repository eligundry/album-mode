import Database from 'better-sqlite3'
import { and, eq, ne, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { reviewedItems, reviewers, spotifyGenres } from './schema.server'

export { reviewedItems, reviewers, spotifyGenres }

const sqlite = new Database('data.db')
export const db = drizzle(sqlite)

const getRandomReviewedItem = async ({
  reviewerSlug,
  exceptID = 0,
}: {
  reviewerSlug: string
  exceptID?: number | string
}) => {
  const itemID = db
    .select({ id: reviewedItems.id })
    .from(reviewedItems)
    .innerJoin(
      reviewers,
      and(
        eq(reviewers.slug, reviewerSlug),
        eq(reviewers.id, reviewedItems.reviewerID)
      )
    )
    .where(
      and(
        eq(reviewedItems.resolvable, 1),
        exceptID ? ne(reviewedItems.id, Number(exceptID)) : undefined
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get()

  return db
    .select({
      id: reviewedItems.id,
      album: reviewedItems.name,
      artist: reviewedItems.creator,
      service: reviewedItems.service,
      reviewURL: reviewedItems.reviewURL,
      reviewMetadata: reviewedItems.metadata,
      publicationName: reviewers.name,
      publicationSlug: reviewers.slug,
      publicationMetadata: reviewers.metadata,
    })
    .from(reviewedItems)
    .innerJoin(reviewers, eq(reviewers.id, reviewedItems.reviewerID))
    .where(eq(reviewedItems.id, itemID.id))
    .limit(1)
    .get()
}

const api = { getRandomReviewedItem }

export default api
