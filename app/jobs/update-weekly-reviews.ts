import csv from '@fast-csv/format'

import '~/env.server'

import albumOfTheYear from './sites/albumoftheyear.org'
import bandcampDaily from './sites/bandcamp-daily'
import { albumCsvSchema } from './types'

const stream = csv.format({ headers: false })
stream.pipe(process.stdout)

await albumOfTheYear.scrapeReviewsGallery({
  slug: '1-pitchfork',
  onWrite: async (item) => {
    // Only capture reviews with a score of 7.0 or higher
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'pitchfork',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
      score: item.score,
    })

    stream.write(serialziedItem)
    return true
  },
})

await albumOfTheYear.scrapeReviewsGallery({
  slug: '57-the-needle-drop',
  onWrite: async (item) => {
    // Only capture reviews with a score of 6.0 or higher. He grades super hard.
    if (!item.score || item.score < 60) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'needle-drop',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
      score: item.score,
    })

    stream.write(serialziedItem)
    return true
  },
})

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

    stream.write(item)
    return true
  },
})
