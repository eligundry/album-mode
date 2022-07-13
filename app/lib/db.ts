import {
  Prisma,
  PrismaClient,
  AlbumReviewedByPublication,
  Artist,
} from '@prisma/client'
import sample from 'lodash/sample'
import groupBy from 'lodash/groupBy'

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
      Pick<AlbumReviewedByPublication, 'id' | 'aritst' | 'album' | 'slug'>[]
    >(
      Prisma.sql`
        SELECT
          a.id,
          a.aritst,
          a.album,
          a.slug
        FROM albumReviewedByPublication a
        WHERE a.id = (
          SELECT albumReviewedByPublication.id
          FROM albumReviewedByPublication
          JOIN publication ON (
            publication.slug = ${publicationSlug}
            AND albumReviewedByPublication.publicationID = publication.id
          )
          ORDER BY random()
          LIMIT 1
        )
        LIMIT 1
      `
    )
    .then((res) => res?.[0])

const getRandomBandcampDailyAlbum = async () =>
  prisma.bandcampDailyAlbum.findMany().then((albums) => sample(albums))

const searchGenres = async (q: string): Promise<string[]> =>
  prisma.spotifyGenere
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
    })
    .then((res) => res.map(({ name }) => name))

const getTopGenres = async (): Promise<string[]> =>
  prisma.spotifyGenere
    .findMany({
      select: {
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: 100,
    })
    .then((res) => res.map(({ name }) => name))

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

const api = {
  prisma,
  getLabels,
  getLabelBySlug,
  getPublications,
  getRandomAlbumForPublication,
  getRandomBandcampDailyAlbum,
  getArtistGroupings,
  getRandomArtistFromGroupSlug,
  searchGenres,
  getTopGenres,
  getSubreddits,
}

export default api
