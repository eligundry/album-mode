import { PrismaClient } from '@prisma/client'
import kebabCase from 'lodash/kebabCase'

const db = new PrismaClient()

const publications = [
  {
    name: 'Pazz & Jop',
    slug: 'pazz-and-jop',
  },
  {
    name: 'Pitchfork Best New Music',
    slug: 'p4k-bnm',
  },
]

const labels = [
  {
    name: 'Count Your Lucky Stars',
  },
]

async function seed() {
  await Promise.all(
    publications.map((publication) =>
      db.publication.create({ data: publication })
    )
  )

  await Promise.all(
    labels.map((label) =>
      db.label.create({
        data: {
          name: label.name,
          slug: kebabCase(label.name),
        },
      })
    )
  )
}

seed()
