import {
  Prisma,
  PrismaClient,
  AlbumReviewedByPublication,
} from '@prisma/client'
import sample from 'lodash/sample'
import kebabCase from 'lodash/kebabCase'
import groupBy from 'lodash/groupBy'

const prisma = new PrismaClient()

const getLabels = async () =>
  prisma.label
    .findMany({
      select: {
        name: true,
        slug: true,
        genre: true,
        displayName: true,
      },
      orderBy: {
        name: 'asc',
      },
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
        JOIN publication ON (
          publication.id = a.publicationID
          AND publication.slug = ${publicationSlug}
        )
        ORDER BY random()
        LIMIT 1
      `
    )
    .then((res) => res?.[0])

const getRandomBandcampDailyAlbum = async () =>
  prisma.bandcampDailyAlbum.findMany().then((albums) => sample(albums))

const createLabelFromAdmin = (data: FormData) => {
  const name = data.get('name')

  if (!name) {
    throw new Error('name is required')
  } else if (typeof name !== 'string') {
    throw new Error('name must be a string')
  }

  const genre = data.get('genre')

  if (typeof genre !== 'string') {
    throw new Error('genre must be supplied')
  }

  let slug = data.get('slug')

  if (typeof slug !== 'string' || !slug) {
    slug = kebabCase(name)
  }

  let displayName = data.get('displayName') || null

  if (displayName && typeof displayName !== 'string') {
    throw new Error('displayName must be a string')
  }

  return prisma.label.create({
    data: {
      name,
      slug,
      genre,
      displayName,
    },
  })
}

const api = {
  prisma,
  getLabels,
  getLabelBySlug,
  getPublications,
  getRandomAlbumForPublication,
  getRandomBandcampDailyAlbum,
  createLabelFromAdmin,
}

export default api
