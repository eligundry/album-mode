import Database from 'better-sqlite3'
import {
  Logger as DrizzleLogger,
  and,
  eq,
  like,
  lt,
  ne,
  sql,
} from 'drizzle-orm'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { Logger as WinstonLogger } from 'winston'

// import env from '~/env.server'
import { reviewedItems, reviewers, spotifyGenres } from './schema.server'
import type { ReviewedItem, Reviewer, SpotifyGenre } from './schema.server'

export { reviewedItems, reviewers, spotifyGenres }
export type { Reviewer, ReviewedItem, SpotifyGenre }

const sqlite = new Database('data.db')
export const db = drizzle(sqlite)

export interface DatabaseClientOptions {
  path: string
  logger?: WinstonLogger | boolean
}

class DatabaseLogger implements DrizzleLogger {
  private logger: WinstonLogger

  constructor(logger: WinstonLogger) {
    this.logger = logger.child({ label: 'drizzle' })
  }

  logQuery(query: string, params: unknown[]) {
    this.logger.info({ query, params })
  }
}

export class DatabaseClient {
  public db: BetterSQLite3Database

  constructor(options: DatabaseClientOptions) {
    const sqlite = new Database(options.path)
    let logger: boolean | DatabaseLogger = false

    if (typeof options.logger === 'boolean') {
      logger = options.logger
    } else if (options.logger) {
      logger = new DatabaseLogger(options.logger)
    }

    this.db = drizzle(sqlite, { logger })
  }

  getRandomReviewedItem = async ({
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

  getPublications = async () =>
    db
      .select({
        name: reviewers.name,
        slug: reviewers.slug,
      })
      .from(reviewers)
      .where(eq(reviewers.service, 'publication'))
      .orderBy(reviewers.name)
      .all()

  getTopGenres = async (limit = 100) =>
    db
      .select({ name: spotifyGenres.name })
      .from(spotifyGenres)
      .orderBy(spotifyGenres.id)
      .limit(limit)
      .all()
      .map((genre) => genre.name)

  searchGenres = async (q: string) =>
    db
      .select({ name: spotifyGenres.name })
      .from(spotifyGenres)
      .where(like(spotifyGenres.name, q + '%'))
      .orderBy(spotifyGenres.id)
      .limit(100 * q.length)
      .all()
      .map((genre) => genre.name)

  getRandomGenre = async (limit?: number) => {
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

  getTwitterUsers = async () =>
    db
      .select({ username: reviewers.name })
      .from(reviewers)
      .where(eq(reviewers.service, 'twitter'))
      .orderBy(sql`1 COLLATE NOCASE`)
      .all()
      .map((user) => user.username)

  getRandomPublication = async () =>
    db
      .select({ slug: reviewers.slug })
      .from(reviewers)
      .where(eq(reviewers.service, 'publication'))
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .get().slug

  getOrCreatePublication = async (data: {
    name: string
    slug: string
    service: typeof reviewers.service._.data
    metadata?: typeof reviewers.metadata._.data
  }) => {
    try {
      const { lastInsertRowid } = db
        .insert(reviewers)
        .values({
          name: data.name,
          slug: data.slug,
          service: data.service,
          metadata: data.metadata ?? {},
        })
        .run()

      return this.db
        .select()
        .from(reviewers)
        .where(eq(reviewers.id, lastInsertRowid as number))
        .get()
    } catch (e) {
      return this.getPublication(data.slug)
    }
  }

  getPublication = async (slug: string) =>
    db.select().from(reviewers).where(eq(reviewers.slug, slug)).get()

  insertReviewedItem = async (data: {
    reviewerID: number
    reviewURL: string
    name: string
    creator: string
    metadata?: ReviewedItem['metadata']
    service?: 'spotify' | 'bandcamp'
  }) => {
    const values = {
      reviewerID: data.reviewerID,
      reviewURL: data.reviewURL,
      name: data.name,
      creator: data.creator,
      service: data.service ?? 'spotify',
    }

    if (data.metadata) {
      // @ts-ignore
      values.metadata = data.metadata
    }

    try {
      return db.insert(reviewedItems).values(values).run().lastInsertRowid
    } catch (e) {
      return db
        .update(reviewedItems)
        .set(values)
        .where(
          and(
            eq(reviewedItems.reviewerID, data.reviewerID),
            eq(reviewedItems.reviewURL, data.reviewURL)
          )
        )
        .returning()
        .get().id
    }
  }
}

const api = new DatabaseClient({ path: 'data.db' })

export default api
