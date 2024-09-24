import csv from '@fast-csv/format'
import fs from 'node:fs'
import path from 'node:path'

import { constructConsoleDatabase } from '~/lib/database/index.server'

import '~/env.server'

import albumOfTheYear from './sites/albumoftheyear.org'
import bandcampDaily from './sites/bandcamp-daily'
import residentAdvisor from './sites/resident-advisor'
import { albumCsvSchema } from './types'

const localDB = constructConsoleDatabase({ local: true })
const remoteDB = constructConsoleDatabase({ local: false })
const filename = path.join('.data', 'daily', `${new Date().toISOString()}.csv`)
const fileStream = fs.createWriteStream(filename, { encoding: 'utf8' })
const stream = csv.format({ headers: true })
stream.pipe(fileStream).on('end', () => fileStream.close())

const albumOfTheYearsToGrab = {
  pitchfork: {
    minScore: 70,
    aotySlug: '1-pitchfork',
  },
  'needle-drop': {
    minScore: 60,
    aotySlug: '57-the-needle-drop',
  },
  'northern-transmissions': {
    minScore: 70,
    aotySlug: '54-northern-transmissions',
  },
  paste: {
    minScore: 70,
    aotySlug: '2-paste',
  },
  'all-music': {
    minScore: 70,
    aotySlug: '8-all-music',
  },
  spin: {
    minScore: 70,
    aotySlug: '10-spin',
  },
}

for (const [reviewer, { minScore, aotySlug }] of Object.entries(
  albumOfTheYearsToGrab,
)) {
  const publication = await localDB.model.getPublication(reviewer)

  await albumOfTheYear.scrapeReviewsGallery({
    slug: aotySlug,
    onWrite: async (item) => {
      // Only capture reviews with a score of 7.0 or higher
      if (!item.score || item.score < minScore) {
        return true
      }

      const serialziedItem = albumCsvSchema.parse({
        reviewer,
        reviewURL: item.url,
        name: item.album,
        creator: item.artist,
        score: item.score,
      })

      const alreadySaved = await localDB.model.reviewedItemIsAlreadySaved({
        reviewerSlug: reviewer,
        itemURL: item.url,
      })

      if (!alreadySaved) {
        const dbItem = {
          reviewerID: publication.id,
          reviewURL: serialziedItem.reviewURL,
          list: serialziedItem.list,
          name: serialziedItem.name,
          creator: serialziedItem.creator,
          service: serialziedItem.service,
          score: serialziedItem.score,
          metadata: JSON.parse(serialziedItem.metadata),
        }
        localDB.model.insertReviewedItem(dbItem)
        remoteDB.model.insertReviewedItem(dbItem)
        stream.write(serialziedItem)
      }

      return !alreadySaved
    },
  })
}

const bandcampDailyPublication =
  await localDB.model.getPublication('bandcamp-daily')

await bandcampDaily.scrape({
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'bandcamp-daily',
      reviewURL: item.bandcampDailyURL,
      name: item.title,
      creator: item.artist,
      service: 'bandcamp',
      metadata: {
        bandcamp: {
          url: item.raw.url,
          albumID: item.raw.id,
          imageURL: item.imageUrl,
        },
      },
    })

    const alreadySaved = await localDB.model.reviewedItemIsAlreadySaved({
      reviewerSlug: 'bandcamp-daily',
      itemURL: item.bandcampDailyURL,
    })

    if (!alreadySaved) {
      const dbItem = {
        reviewerID: bandcampDailyPublication.id,
        reviewURL: serialziedItem.reviewURL,
        list: serialziedItem.list,
        name: serialziedItem.name,
        creator: serialziedItem.creator,
        service: serialziedItem.service,
        score: serialziedItem.score,
        metadata: JSON.parse(serialziedItem.metadata),
      }
      localDB.model.insertReviewedItem(dbItem)
      remoteDB.model.insertReviewedItem(dbItem)
      stream.write(serialziedItem)
    }

    return !alreadySaved
  },
})

const residentAdvisorPublication =
  await localDB.model.getPublication('resident-advisor')

await residentAdvisor.scrape({
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'resident-advisor',
      reviewURL: item.url,
      name: item.title,
      creator: item.artist,
      list: item.raRecommends ? 'RA Recommends' : null,
    })

    const alreadySaved = await localDB.model.reviewedItemIsAlreadySaved({
      reviewerSlug: 'resident-advisor',
      itemURL: item.url,
    })

    if (!alreadySaved) {
      const dbItem = {
        reviewerID: residentAdvisorPublication.id,
        reviewURL: serialziedItem.reviewURL,
        list: serialziedItem.list,
        name: serialziedItem.name,
        creator: serialziedItem.creator,
        service: serialziedItem.service,
        score: serialziedItem.score,
        metadata: JSON.parse(serialziedItem.metadata),
      }
      localDB.model.insertReviewedItem(dbItem)
      remoteDB.model.insertReviewedItem(dbItem)
      stream.write(serialziedItem)
    }

    return !alreadySaved
  },
})

stream.end()
