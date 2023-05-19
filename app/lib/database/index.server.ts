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
  exceptID?: number
}) => {
  const itemIDSubquery = db
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
        exceptID ? ne(reviewedItems.id, exceptID) : undefined
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .as('sq')

  return db
    .select()
    .from(reviewedItems)
    .innerJoin(reviewers, eq(reviewers.id, reviewedItems.reviewerID))
    .where(eq(reviewedItems.id, itemIDSubquery.id))
    .limit(1)
    .get()
}

const api = { getRandomReviewedItem }

export default api
