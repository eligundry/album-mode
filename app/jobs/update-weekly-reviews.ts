import csv from '@fast-csv/format'

import albumOfTheYear from './album-of-the-year-v2'

const stream = csv.format({ headers: false })
stream.pipe(process.stdout)

await albumOfTheYear.scrapeReviewsGallery({
  slug: '1-pitchfork',
  onShouldContinue: async (_item) => true,
  onWrite: async (item) => {
    // Only capture reviews with a score of 7.0 or higher
    if (!item.score || item.score < 70) {
      return
    }

    stream.write(item)
  },
})

await albumOfTheYear.scrapeReviewsGallery({
  slug: '57-the-needle-drop',
  onShouldContinue: async (_item) => true,
  onWrite: async (item) => {
    // Only capture reviews with a score of 6.0 or higher. He grades super hard.
    if (!item.score || item.score < 60) {
      return
    }

    stream.write(item)
  },
})
