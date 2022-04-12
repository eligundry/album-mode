import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getLabels = async () =>
  prisma.label.findMany({
    select: {
      name: true,
      slug: true,
    },
  })

const getPublications = async () =>
  prisma.publication.findMany({
    select: {
      name: true,
      slug: true,
    },
  })

const api = { prisma, getLabels, getPublications }

export default api
