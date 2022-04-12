import { PrismaClient } from '@prisma/client'
import sample from 'lodash/sample'

const prisma = new PrismaClient()

const getLabels = async () =>
  prisma.label.findMany({
    select: {
      name: true,
      slug: true,
    },
  })

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

const api = {
  prisma,
  getLabels,
  getLabelBySlug,
  getPublications,
  getRandomAlbumForPublication,
}

export default api
