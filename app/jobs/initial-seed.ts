import csv from '@fast-csv/format'
import fs from 'node:fs'
import path from 'node:path'

import '~/env.server'

import albumOfTheYear from './sites/albumoftheyear.org'
import bandcampDaily from './sites/bandcamp-daily'
import christgau from './sites/robert-christgau'
import { albumCsvSchema } from './types'

const fileStream = fs.createWriteStream(
  path.join('.data', `initial-${new Date().toISOString()}.csv`),
  { encoding: 'utf8' },
)
const stream = csv.format({ headers: true })
stream.pipe(fileStream).on('end', () => process.exit(0))

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
      reviewURL: item.bandcampDailyURL,
      name: item.title,
      creator: item.artist,
      metadata: {
        bandcamp: {
          url: item.raw.url,
          albumID: item.raw.id,
          imageURL: item.imageUrl,
        },
      },
    })

    stream.write(serialziedItem)
    return true
  },
})

await christgau.scrapePazzAndJop({
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'robert-christgau',
      list: 'pazz-and-jop',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
    })
    stream.write(serialziedItem)
    return true
  },
})

await christgau.scrapePazzAndJopDeansLists({
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'robert-christgau',
      list: 'deans-list',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
    })
    stream.write(serialziedItem)
    return true
  },
})

await albumOfTheYear.scrapeList({
  slug: '428-rolling-stones-500-greatest-albums-of-all-time',
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'rolling-stone',
      list: '500 Greatest Albums of All Time (2012)',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
    })
    stream.write(serialziedItem)
    return true
  },
})

await albumOfTheYear.scrapeList({
  slug: '1500-rolling-stones-500-greatest-albums-of-all-time-2020',
  onWrite: async (item) => {
    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'rolling-stone',
      list: '500 Greatest Albums of All Time (2020)',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
    })
    stream.write(serialziedItem)
    return true
  },
})

await albumOfTheYear.scrapeReviewsGallery({
  slug: '54-northern-transmissions',
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'northern-transmissions',
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
  slug: '26-sputnikmusic',
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'sputnikmusic',
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
  slug: '11-paste',
  startPage: 4,
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'paste',
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
  slug: '8-all-music',
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'all-music',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
      score: item.score,
    })

    stream.write(serialziedItem)
    return true
  },
})

const passionWeissList = {
  '2023': {
    slug: '2242-passion-of-the-weisss-best-albums-of-2023',
    url: 'https://www.passionweiss.com/2023/12/28/pow-best-albums-2023/',
  },
  '2022': {
    slug: '2066-passion-of-the-weisss-best-albums-of-2022',
    url: 'https://www.passionweiss.com/2022/12/29/pow-best-albums-2022/',
  },
  '2021': {
    slug: '1876-passion-of-the-weisss-best-albums-of-2021',
    url: 'https://www.passionweiss.com/2021/12/30/the-pow-best-albums-of-2021/',
  },
  '2020': {
    slug: '1672-passion-of-the-weisss-best-albums-of-2020',
    url: 'https://www.passionweiss.com/2020/12/29/the-pow-best-albums-of-2020/',
  },
  '2019': {
    slug: '1437-passion-of-the-weisss-best-albums-of-2019',
    url: 'https://www.passionweiss.com/2019/12/31/best-albums-2019-pow/',
  },
  '2018': {
    slug: '1188-passion-of-the-weisss-best-albums-of-2018',
    url: 'https://www.passionweiss.com/2018/12/24/best-albums-of-2018/',
  },
  '2017': {
    slug: '940-passion-of-the-weisss-best-albums-of-2017',
    url: 'https://www.passionweiss.com/2017/12/18/best-albums-of-2017-50-26/',
  },
  '2016': {
    slug: '705-passion-of-the-weiss-best-albums-of-2016',
    url: 'http://www.passionweiss.com/2016/12/12/best-albums-of-2016/',
  },
  '2015': {
    slug: '515-passion-of-the-weiss-best-albums-of-2015',
    url: 'http://www.passionweiss.com/2015/12/20/2015-best-albums/',
  },
  '2014': {
    slug: '365-passion-of-the-weiss-top-50-albums-of-2014',
    url: 'http://www.passionweiss.com/2014/12/12/best-albums-2014/',
  },
}

for (const [year, { slug, url }] of Object.entries(passionWeissList)) {
  let counter = 1
  await albumOfTheYear.scrapeList({
    slug,
    onWrite: async (item) => {
      let reviewURL = new URL(url)

      if (year === '2017' && counter > 25) {
        reviewURL = new URL(
          'https://www.passionweiss.com/2017/12/19/best-albums-of-2017-25-1/',
        )
      }

      reviewURL.hash = `:~:text=${item.album}`

      const serialziedItem = albumCsvSchema.parse({
        reviewer: 'passion-of-the-weiss',
        list: `Best Albums of ${year}`,
        reviewURL: reviewURL.toString(),
        name: item.album,
        creator: item.artist,
      })
      stream.write(serialziedItem)
      counter++
      return true
    },
  })
}

const kcrwList = {
  '2023': {
    slug: '2152-kcrws-best-albums-of-2023',
    url: 'https://www.kcrw.com/best-of-2023/best-of-2023/best-albums',
  },
  '2022': {
    slug: '2006-kcrws-22-best-albums-of-2022',
    url: 'https://www.kcrw.com/best-2022/best-albums-2022',
  },
  '2021': {
    slug: '1856-kcrws-21-best-albums-of-2021',
    url: 'https://www.kcrw.com/best-of/best-albums-2021',
  },
  '2020': {
    slug: '1649-kcrws-top-10-albums-of-2020',
    url: 'https://www.kcrw.com/best-of/best-of-music-songs-albums-2020-year-end-list',
  },
  '2019': {
    slug: '1315-kcrws-best-albums-of-2019',
    url: 'https://blogs.kcrw.com/pressroom/2019/12/kcrw-reveals-best-of-2019/',
  },
  '2018': {
    slug: '1042-kcrws-best-albums-of-2018',
    url: 'https://www.kcrw.com/best-of-2018',
  },
  '2017': {
    slug: '869-kcrws-best-albums-of-2017',
    url: 'https://www.kcrw.com/best-of-2017',
  },
  '2016': {
    slug: '614-kcrws-best-albums-of-2016',
    url: 'http://www.kcrw.com/best-of-2016/best-of-2016',
  },
  '2010s': {
    slug: '1335-kcrws-best-albums-of-the-2010s',
    url: undefined,
  },
}

for (const [year, { slug, url }] of Object.entries(kcrwList)) {
  await albumOfTheYear.scrapeList({
    slug,
    onWrite: async (item) => {
      const reviewURL = new URL(
        url ? url : `https://www.albumoftheyear.org/list/${slug}/`,
      )
      reviewURL.hash = `:~:text=${item.album}`

      const serialziedItem = albumCsvSchema.parse({
        reviewer: 'kcrw',
        list: `Best Albums of ${year}`,
        reviewURL: reviewURL.toString(),
        name: item.album,
        creator: item.artist,
      })
      stream.write(serialziedItem)
      return true
    },
  })
}

// Misc Pitchfork lists
const miscPitchforkLists = {
  'Best Ambient': {
    slug: '559-pitchforks-50-best-ambient-albums-of-all-time',
    url: 'http://pitchfork.com/features/lists-and-guides/9948-the-50-best-ambient-albums-of-all-time/',
  },
  'Best IDM': {
    slug: '750-pitchforks-50-best-idm-albums-of-all-time',
    url: 'http://pitchfork.com/features/lists-and-guides/10011-the-50-best-idm-albums-of-all-time/',
  },
  'Best Shoegaze': {
    slug: '558-pitchforks-50-best-shoegaze-albums-of-all-time',
    url: 'http://pitchfork.com/features/lists-and-guides/9966-the-50-best-shoegaze-albums-of-all-time/',
  },
  'Best Dream Pop Albums': {
    slug: '981-pitchforks-30-best-dream-pop-albums',
    url: 'https://pitchfork.com/features/lists-and-guides/the-30-best-dream-pop-albums/',
  },
  'Best Britpop Albums': {
    slug: '751-pitchforks-50-best-britpop-albums',
    url: 'http://pitchfork.com/features/lists-and-guides/10045-the-50-best-britpop-albums/',
  },
  'Best Albums of the 1960s': {
    slug: '786-pitchforks-200-best-albums-of-the-1960s',
    url: 'http://pitchfork.com/features/lists-and-guides/the-200-best-albums-of-the-1960s/',
  },
  'Best Albums of the 1980s': {
    slug: '1001-pitchforks-200-best-albums-of-the-1980s',
    url: 'https://pitchfork.com/features/lists-and-guides/the-200-best-albums-of-the-1980s/',
  },
  'Best Album of the 1970s': {
    slug: '183-pitchforks-top-100-albums-of-the-1970s',
    url: 'http://pitchfork.com/features/staff-lists/5932-top-100-albums-of-the-1970s/',
  },
  'Best Indie Pop of the 1990s': {
    slug: '1914-pitchforks-25-best-indie-pop-albums-of-the-90s',
    url: 'https://pitchfork.com/features/lists-and-guides/the-best-indie-pop-albums-of-the-90s/',
  },
  'Best Grunge of the 1990s': {
    slug: '1912-pitchforks-25-best-grunge-albums-of-the-90s',
    url: 'https://pitchfork.com/features/lists-and-guides/the-best-grunge-albums-of-the-90s/',
  },
}
for (const [name, { slug, url }] of Object.entries(miscPitchforkLists)) {
  await albumOfTheYear.scrapeList({
    slug,
    onWrite: async (item) => {
      const reviewURL = new URL(url)
      reviewURL.hash = `:~:text=${item.album}`

      const serialziedItem = albumCsvSchema.parse({
        reviewer: 'pitchfork',
        list: name,
        reviewURL: reviewURL.toString(),
        name: item.album,
        creator: item.artist,
      })
      stream.write(serialziedItem)
      return true
    },
  })
}

await albumOfTheYear.scrapeReviewsGallery({
  slug: '27-resident-advisor',
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'resident-advisor',
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
  slug: '10-spin',
  onWrite: async (item) => {
    if (!item.score || item.score < 70) {
      return true
    }

    const serialziedItem = albumCsvSchema.parse({
      reviewer: 'spin',
      reviewURL: item.url,
      name: item.album,
      creator: item.artist,
      score: item.score,
    })

    stream.write(serialziedItem)
    return true
  },
})

// 1971 list is interesting enough
{
  let counter = 50
  await albumOfTheYear.scrapeList({
    slug: '1901-spins-50-best-albums-of-1971',
    onWrite: async (item) => {
      let reviewURL = new URL(
        'https://www.spin.com/2021/01/50-best-albums-of-1971/',
      )
      reviewURL.hash = `:~:text=${item.album}`

      if (counter < 11) {
        reviewURL.pathname += '3'
      } else if (counter < 31) {
        reviewURL.pathname += '2'
      }

      const serialziedItem = albumCsvSchema.parse({
        reviewer: 'spin',
        list: '50 Best Albums of 1971',
        reviewURL: item.url,
        name: item.album,
        creator: item.artist,
        score: item.score,
      })
      stream.write(serialziedItem)
      counter--
      return true
    },
  })
}

stream.end()
