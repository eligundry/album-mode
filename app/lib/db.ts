import { PrismaClient } from '@prisma/client'
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

// @TODO We can't natively search by random
// https://github.com/prisma/prisma/discussions/5886
const getRandomAlbumForPublication = async (publicationSlug: string) =>
  prisma.albumReviewedByPublication
    .findMany({
      where: {
        publication: {
          slug: publicationSlug,
        },
      },
    })
    .then((albums) => sample(albums))

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

  return prisma.label.create({
    data: {
      name,
      slug,
      genre,
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
