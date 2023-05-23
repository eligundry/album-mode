import Database from 'better-sqlite3'
import { and, eq, like, lt, ne, sql } from 'drizzle-orm'
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

const getPublications = async () =>
  db
    .select({
      name: reviewers.name,
      slug: reviewers.slug,
    })
    .from(reviewers)
    .where(eq(reviewers.service, 'publication'))
    .orderBy(reviewers.name)
    .all()

const getTopGenres = async (limit = 100) =>
  db
    .select({ name: spotifyGenres.name })
    .from(spotifyGenres)
    .orderBy(spotifyGenres.id)
    .limit(limit)
    .all()
    .map((genre) => genre.name)

const searchGenres = async (q: string) =>
  db
    .select({ name: spotifyGenres.name })
    .from(spotifyGenres)
    .where(like(spotifyGenres.name, q + '%'))
    .orderBy(spotifyGenres.id)
    .limit(100 * q.length)
    .all()
    .map((genre) => genre.name)

const getRandomGenre = async (limit?: number) => {
  const { id } = db
    .select({ id: spotifyGenres.id })
    .from(spotifyGenres)
    .where(limit ? lt(spotifyGenres.id, limit) : undefined)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get()

  return db
    .select({ name: spotifyGenres.name })
    .from(spotifyGenres)
    .where(eq(spotifyGenres.id, id))
    .limit(1)
    .get().name
}

const getTwitterUsers = async () =>
  db
    .select({ username: reviewers.name })
    .from(reviewers)
    .where(eq(reviewers.service, 'twitter'))
    .orderBy(sql`1 COLLATE NOCASE`)
    .all()
    .map((user) => user.username)

const getRandomPublication = async () =>
  db
    .select({ slug: reviewers.slug })
    .from(reviewers)
    .where(eq(reviewers.service, 'publication'))
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get().slug

const api = {
  getRandomReviewedItem,
  getPublications,
  getTopGenres,
  searchGenres,
  getTwitterUsers,
  getRandomPublication,
  getRandomGenre,
}

export default api
