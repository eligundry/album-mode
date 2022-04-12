import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getLabels = async () => prisma.label.findMany()
const getPublications = async () => prisma.publication.findMany()

const api = { prisma, getLabels, getPublications }

export default api
