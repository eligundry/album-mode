import { constructConsoleDatabase } from '~/lib/database/index.server'

import '~/env.server'

import bandcampDaily from './sites/bandcamp-daily'
import { albumCsvSchema } from './types'

const localDB = constructConsoleDatabase({ local: true })

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

    const dbItem = {
      reviewerID: 2,
      reviewURL: serialziedItem.reviewURL,
      list: serialziedItem.list,
      name: serialziedItem.name,
      creator: serialziedItem.creator,
      service: serialziedItem.service,
      score: serialziedItem.score,
      metadata: JSON.parse(serialziedItem.metadata),
    }
    await localDB.model.insertReviewedItem(dbItem)

    return true
  },
})
