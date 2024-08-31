import csv from '@fast-csv/format'
import subProcess from 'child_process'
import fs from 'node:fs'
import path from 'node:path'

import { constructConsoleDatabase } from '~/lib/database/index.server'

import '~/env.server'

import albumOfTheYear from './sites/albumoftheyear.org'
import bandcampDaily from './sites/bandcamp-daily'
import { albumCsvSchema } from './types'

const { model } = constructConsoleDatabase()
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

      const alreadySaved = await model.reviewedItemIsAlreadySaved({
        reviewerSlug: reviewer,
        itemURL: item.url,
      })

      if (!alreadySaved) {
        stream.write(serialziedItem)
      }

      return !alreadySaved
    },
  })
}

await bandcampDaily.scrape({
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'bandcamp-daily',
      reviewURL: item.url,
      name: item.title,
      creator: item.artist,
      metadata: {
        bandcamp: {
          url: item.raw.url,
          albumID: item.raw.id,
        },
      },
    })

    const alreadySaved = await model.reviewedItemIsAlreadySaved({
      reviewerSlug: 'bandcamp-daily',
      itemURL: item.url,
    })

    if (!alreadySaved) {
      stream.write(serialziedItem)
    }

    return !alreadySaved
  },
})

stream.end()

await new Promise((resolve, reject) => {
  subProcess.exec(
    `bash ./scripts/load-daily-update.sh "${filename}"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return reject(err)
      }

      console.log(stdout.toString())
      if (stderr) console.error(stderr.toString())
      resolve(stdout.toString())
    },
  )
})
