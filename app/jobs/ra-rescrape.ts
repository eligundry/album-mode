import { constructConsoleDatabase } from '~/lib/database/index.server'

import '~/env.server'

import residentAdvisor from './sites/resident-advisor'
import { albumCsvSchema } from './types'

const localDB = constructConsoleDatabase({ local: true })

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
      reviewerSlug: serialziedItem.reviewer,
      itemURL: item.url,
    })

    if (!alreadySaved) {
      const dbItem = {
        reviewerID: 9,
        reviewURL: serialziedItem.reviewURL,
        list: serialziedItem.list,
        name: serialziedItem.name,
        creator: serialziedItem.creator,
        service: serialziedItem.service,
        score: serialziedItem.score,
        metadata: JSON.parse(serialziedItem.metadata),
      }
      await localDB.model.insertReviewedItem(dbItem)
    }

    return !alreadySaved
  },
})
