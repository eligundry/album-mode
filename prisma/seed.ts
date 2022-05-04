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
  {
    name: 'Pitchfork Best Reissues',
    slug: 'p4k-bnr',
  },
  {
    name: 'Pitchfork 8.0+ Reviews',
    slug: 'p4k-8-plus',
  },
  {
    name: 'Pitchfork Sunday Reviews',
    slug: 'p4k-sunday-reviews',
  },
  {
    name: 'RS Top 500',
    slug: 'rs-top-500',
  },
  {
    name: 'Bandcamp Daily',
    slug: 'bandcamp-daily',
  },
]

const labels = [
  {
    name: 'Count Your Lucky Stars',
  },
  {
    name: 'Stones Throw',
  },
  {
    name: 'K Records',
  },
  {
    name: 'Matador',
  },
  {
    name: 'Warp',
  },
  {
    name: '4AD',
  },
  {
    name: 'Domino',
  },
  {
    name: 'Roc-a-fella',
  },
  {
    name: 'Carpark',
  },
  {
    name: 'Ghostly International',
  },
  {
    name: 'Brainfeeder',
  },
  {
    name: 'OVO',
  },
]

async function seed() {
  await Promise.all(
    publications.map((publication) =>
      db.publication.create({ data: publication }).catch((e) => {})
    )
  )

  await Promise.all(
    labels.map((label) =>
      db.label
        .create({
          data: {
            name: label.name,
            slug: kebabCase(label.name),
          },
        })
        .catch((e) => {})
    )
  )
}

seed()
