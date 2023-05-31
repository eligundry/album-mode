import { createClient as createTursoClient } from '@libsql/client'
import {
  Logger as DrizzleLogger,
  and,
  desc,
  eq,
  isNull,
  like,
  lt,
  ne,
  sql,
} from 'drizzle-orm'
import { drizzle as tursoDrizzle } from 'drizzle-orm/libsql'
import omit from 'lodash/omit'
import { Logger as WinstonLogger } from 'winston'

import type { LocalLibraryItem, ServerLibraryItem } from '~/lib/types/library'

import { getEnv } from '~/env.server'

import { librarySelectColumns } from './libraryQuery'
import {
  reviewedItems,
  reviewers,
  savedItems,
  spotifyGenres,
} from './schema.server'
import type { ReviewedItem, Reviewer, SpotifyGenre } from './schema.server'

export { reviewedItems, reviewers, spotifyGenres, savedItems }
export type { Reviewer, ReviewedItem, SpotifyGenre }

class DatabaseLogger implements DrizzleLogger {
  private logger: WinstonLogger

  constructor(logger: WinstonLogger) {
    this.logger = logger.child({ label: 'drizzle' })
  }

  logQuery(query: string, params: unknown[]) {
    this.logger.info({ query, params })
  }
}

export interface DatabaseClientOptions {
  drizzle: ReturnType<typeof tursoDrizzle>
}

export class DatabaseClient {
  public db: DatabaseClientOptions['drizzle']

  constructor(options: DatabaseClientOptions) {
    this.db = options.drizzle
  }

  getRandomReviewedItem = async ({
    reviewerSlug,
    exceptID = 0,
  }: {
    reviewerSlug: string
    exceptID?: number | string
  }) => {
    const itemID = await this.db
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

    return this.db
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
    this.db
      .select({
        name: reviewers.name,
        slug: reviewers.slug,
      })
      .from(reviewers)
      .where(eq(reviewers.service, 'publication'))
      .orderBy(reviewers.name)
      .all()

  getTopGenres = async (limit = 100) =>
    this.db
      .select({ name: spotifyGenres.name })
      .from(spotifyGenres)
      .orderBy(spotifyGenres.id)
      .limit(limit)
      .all()
      .then((genres) => genres.map((genre) => genre.name))

  searchGenres = async (q: string) =>
    this.db
      .select({ name: spotifyGenres.name })
      .from(spotifyGenres)
      .where(like(spotifyGenres.name, q + '%'))
      .orderBy(spotifyGenres.id)
      .limit(100 * q.length)
      .all()
      .then((genres) => genres.map((genre) => genre.name))

  getRandomGenre = async (limit?: number) => {
    const { id } = await this.db
      .select({ id: spotifyGenres.id })
      .from(spotifyGenres)
      .where(limit ? lt(spotifyGenres.id, limit) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .get()

    return this.db
      .select({ name: spotifyGenres.name })
      .from(spotifyGenres)
      .where(eq(spotifyGenres.id, id))
      .limit(1)
      .get()
      .then((genre) => genre.name)
  }

  getTwitterUsers = async () =>
    this.db
      .select({ username: reviewers.name })
      .from(reviewers)
      .where(eq(reviewers.service, 'twitter'))
      .orderBy(sql`1 COLLATE NOCASE`)
      .all()
      .then((users) => users.map((user) => user.username))

  getRandomPublication = async () =>
    this.db
      .select({ slug: reviewers.slug })
      .from(reviewers)
      .where(eq(reviewers.service, 'publication'))
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .get()
      .then((publication) => publication.slug)

  getOrCreatePublication = async (data: {
    name: string
    slug: string
    service: typeof reviewers.service._.data
    metadata?: typeof reviewers.metadata._.data
  }) => {
    try {
      const { lastInsertRowid } = await this.db
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
        .where(eq(reviewers.id, Number(lastInsertRowid)))
        .get()
    } catch (e) {
      return this.getPublication(data.slug)
    }
  }

  getPublication = async (slug: string) =>
    this.db.select().from(reviewers).where(eq(reviewers.slug, slug)).get()

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
      const res = await this.db.insert(reviewedItems).values(values).run()
      return res.lastInsertRowid
    } catch (e) {
      return this.db
        .update(reviewedItems)
        .set(values)
        .where(
          and(
            eq(reviewedItems.reviewerID, data.reviewerID),
            eq(reviewedItems.reviewURL, data.reviewURL)
          )
        )
        .returning()
        .get()
        .then((item) => item.id)
    }
  }

  getLibrary = async (username: string): Promise<ServerLibraryItem[]> =>
    this.db
      .select(librarySelectColumns)
      .from(savedItems)
      .where(
        and(
          eq(savedItems.user, username),
          eq(savedItems.type, 'library'),
          isNull(savedItems.deletedAt)
        )
      )
      .orderBy(savedItems.id)
      .all()

  saveItemToLibrary = async ({
    item,
    username,
  }: {
    item: LocalLibraryItem
    username: string
  }) =>
    this.db
      .insert(savedItems)
      .values({
        type: 'library',
        createdAt: item.savedAt ? new Date(item.savedAt) : new Date(),
        user: username,
        identifier: item.url,
        metadata: {
          type: 'library',
          ...omit(item, ['savedAt']),
        },
      })
      .returning(librarySelectColumns)
      .get()

  removeItemFromLibrary = async ({
    id,
    username,
  }: {
    id: number
    username: string
  }) =>
    this.db
      .update(savedItems)
      .set({ deletedAt: new Date() })
      .where(and(eq(savedItems.user, username), eq(savedItems.id, id)))
      .run()
}

interface ConstructDatabaseOptions {
  url: string
  authToken: string
  logger?: WinstonLogger | boolean
}

export const constructRequestDatabase = ({
  url,
  authToken,
  logger = false,
}: ConstructDatabaseOptions) => {
  const turso = createTursoClient({ url, authToken })
  const drizzleLogger =
    typeof logger === 'object' ? new DatabaseLogger(logger) : logger
  const database = tursoDrizzle(turso, { logger: drizzleLogger })

  return {
    database,
    model: new DatabaseClient({ drizzle: database }),
  }
}

export const constructConsoleDatabase = () => {
  const env = getEnv()
  const turso = createTursoClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_AUTH_TOKEN,
  })
  const database = tursoDrizzle(turso)

  return {
    database,
    model: new DatabaseClient({ drizzle: database }),
  }
}
