import { PrismaClient } from '@prisma/client'

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

const api = { prisma, getLabels, getLabelBySlug, getPublications }

export default api
