import {
  Prisma,
  PrismaClient,
  AlbumReviewedByPublication,
  Artist,
  BandcampDailyAlbum,
  SpotifyGenre,
  Publication,
} from '@prisma/client'
import groupBy from 'lodash/groupBy'

import type { Tweet } from '~/lib/types/twitter'

export const prisma = new PrismaClient()

const getLabels = async () =>
  prisma.label
    .findMany({
      select: {
        name: true,
        slug: true,
        genre: true,
        displayName: true,
      },
      orderBy: [{ genre: 'asc' }, { name: 'asc' }],
    })
    .then((labels) => groupBy(labels, ({ genre }) => genre))

const getLabelBySlug = async (slug: string) =>
  prisma.label.findFirst({
    select: {
      name: true,
      slug: true,
    },
    where: {
      slug,
    },
  })

const getPublications = async () =>
  prisma.publication.findMany({
    select: {
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

const getArtistGroupings = async () =>
  prisma.artistGrouping.findMany({
    select: {
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

const getRandomArtistFromGroupSlug = async (groupSlug: string) =>
  prisma
    .$queryRaw<Pick<Artist, 'id' | 'name'>[]>(
      Prisma.sql`
      SELECT
        a.id,
        a.name
      FROM Artist a
      JOIN ArtistGrouping AS ag ON (
        ag.id = a.groupID
        AND ag.slug = ${groupSlug}
      )
      ORDER BY random()
      LIMIT 1
    `
    )
    .then((res) => res?.[0])

// @TODO We can't natively search by random using the query builder
// https://github.com/prisma/prisma/discussions/5886
const getRandomAlbumForPublication = async (publicationSlug: string) =>
  prisma
    .$queryRaw<
      (Pick<AlbumReviewedByPublication, 'id' | 'artist' | 'album' | 'slug'> & {
        publicationName: string
        publicationBlurb: string | null
      })[]
    >(
      Prisma.sql`
        SELECT
          a.id,
          a.artist,
          a.album,
          a.slug,
          p.name AS publicationName,
          p.blurb AS publicationBlurb
        FROM albumReviewedByPublication a
        JOIN publication AS p ON p.id = a.publicationID
        WHERE a.id = (
          SELECT albumReviewedByPublication.id
          FROM albumReviewedByPublication
          JOIN publication ON (
            publication.slug = ${publicationSlug}
            AND albumReviewedByPublication.publicationID = publication.id
          )
          WHERE albumReviewedByPublication.resolvable = true
          ORDER BY random()
          LIMIT 1
        )
        LIMIT 1
      `
    )
    .then((res) => res?.[0])

const getRandomBandcampDailyAlbum = async () =>
  prisma
    .$queryRaw<Omit<BandcampDailyAlbum, 'createdAt' | 'updatedAt'>[]>(
      Prisma.sql`
        SELECT
          a.albumID,
          a.album,
          a.artistID,
          a.artist,
          a.bandcampDailyURL,
          a.url,
          a.imageURL
        FROM BandcampDailyAlbum a
        WHERE a.albumID = (
          SELECT BandcampDailyAlbum.albumID
          FROM BandcampDailyAlbum
          ORDER BY random()
          LIMIT 1
        )
        LIMIT 1
      `
    )
    .then((res) => res[0])

const searchGenres = async (q: string): Promise<string[]> => {
  return prisma.spotifyGenre
    .findMany({
      select: {
        name: true,
      },
      where: {
        name: {
          contains: q,
        },
      },
      orderBy: {
        id: 'asc',
      },
      // grab more results with more input
      take: 100 * q.length,
    })
    .then((res) => res.map(({ name }) => name))
}

const getTopGenres = async (limit = 100): Promise<string[]> =>
  prisma.spotifyGenre
    .findMany({
      select: {
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: limit,
    })
    .then((res) => res.map(({ name }) => name))

const getRandomGenre = async (): Promise<string> =>
  prisma
    .$queryRaw<Pick<SpotifyGenre, 'name'>[]>(
      Prisma.sql`
        SELECT name
        FROM SpotifyGenre
        ORDER BY RANDOM()
        LIMIT 1
      `
    )
    .then((res) => res[0].name)

const getRandomTopGenre = async (limit = 50): Promise<string> =>
  prisma
    .$queryRaw<Pick<SpotifyGenre, 'name'>[]>(
      Prisma.sql`
        SELECT name
        FROM SpotifyGenre
        WHERE (
          id = (
            SELECT id
            FROM SpotifyGenre
            WHERE id < ${limit}
            ORDER BY RANDOM()
            LIMIT 1
          )
        )
      `
    )
    .then((res) => res[0].name)

const getSubreddits = async () =>
  prisma.subreddit
    .findMany({
      select: {
        slug: true,
      },
      orderBy: {
        slug: 'asc',
      },
    })
    .then((res) => res.map(({ slug }) => slug))

const getRandomTweet = async (username: string) =>
  prisma
    .$queryRaw<Tweet[]>(
      Prisma.sql`
        SELECT
          TwitterUser.username,
          TwitterUser.userID,
          TweetAlbum.tweetID,
          TweetAlbum.service,
          TweetAlbum.itemType,
          TweetAlbum.album,
          TweetAlbum.albumID,
          TweetAlbum.artist,
          TweetAlbum.artistID,
          TweetAlbum.url,
          TweetAlbum.imageURL
        FROM TweetAlbum
        JOIN TwitterUser ON (
          TwitterUser.userID = TweetAlbum.twitterUserID
          AND TwitterUser.username = ${username}
        )
        ORDER BY RANDOM()
        LIMIT 1
      `
    )
    .then((tweets) => tweets[0])

const getTwitterUsers = async () =>
  prisma.twitterUser
    .findMany({
      select: {
        username: true,
      },
      orderBy: {
        username: 'asc',
      },
    })
    .then((users) => users.map(({ username }) => username))

const getRandomPublication = async () =>
  prisma
    .$queryRaw<Pick<Publication, 'slug'>[]>(
      Prisma.sql`
        SELECT slug
        FROM Publication
        ORDER BY RANDOM()
        LIMIT 1
      `
    )
    .then((res) => res[0].slug)

const api = {
  prisma,
  getArtistGroupings,
  getLabelBySlug,
  getLabels,
  getPublications,
  getRandomAlbumForPublication,
  getRandomArtistFromGroupSlug,
  getRandomBandcampDailyAlbum,
  getRandomGenre,
  getRandomPublication,
  getRandomTopGenre,
  getRandomTweet,
  getSubreddits,
  getTopGenres,
  getTwitterUsers,
  searchGenres,
}

export default api
