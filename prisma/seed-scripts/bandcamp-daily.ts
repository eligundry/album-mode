import { PrismaClient } from '@prisma/client'
import retry from 'async-retry'
import Bottleneck from 'bottleneck'
import { BrowserContext, chromium } from 'playwright'

import bandcamp from '~/lib/bandcamp.server'
import logger from '~/lib/logging.server'
import { BandcampAlbum } from '~/lib/types/bandcamp'

const bandcampDailyBase = 'https://daily.bandcamp.com'
const bandcampDailyURL = new URL('https://daily.bandcamp.com/album-of-the-day')
const prisma = new PrismaClient()
const dailyLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000 * 3,
})

type DailyBandcampAlbum = BandcampAlbum & {
  bandcampDailyURL: string
}

const scrape = async () => {
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext()
    const promises: Promise<DailyBandcampAlbum | false>[] = []

    for (
      let pageNumber = 1, continueFetching = true;
      continueFetching;
      pageNumber++
    ) {
      const page = await context.newPage()
      bandcampDailyURL.searchParams.set('page', pageNumber.toString())
      logger.info({
        message: 'fetching bandcamp daily listing page',
        url: bandcampDailyURL.toString(),
        pageNumber,
      })
      const response = await page.goto(bandcampDailyURL.toString())

      if (!response || !response.ok) {
        continueFetching = false
        continue
      }

      let paths: string[] = []
      const linkElms = page.locator(
        ".album-of-the-day .list-article.aotd a.title[href*='/album-of-the-day/']"
      )
      const linkElmsCount = await linkElms.count()

      for (let i = 0; i < linkElmsCount; i++) {
        const path = await linkElms.nth(i).getAttribute('href')

        if (!path) {
          logger.warn({
            message: 'could not pull a path from this link element',
            url: bandcampDailyURL.toString(),
            pageNumber,
            elementIndex: i,
          })
          continue
        }

        paths.push(path)
      }

      if (!paths?.length) {
        continueFetching = false
        continue
      }

      const pathsAlreadyFetched =
        (
          await prisma.bandcampDailyAlbum.findMany({
            select: {
              bandcampDailyURL: true,
            },
            where: {
              bandcampDailyURL: {
                in: paths.map((p) => bandcampDailyBase + p),
              },
            },
          })
        )?.map(({ bandcampDailyURL }) => bandcampDailyURL) ?? []

      if (pathsAlreadyFetched.length > 0) {
        continueFetching = false
        paths = paths.filter(
          (p) => !pathsAlreadyFetched.find((pa) => pa.endsWith(p))
        )
      }

      promises.push(
        ...paths.map((path) =>
          getAlbumInfoFromBandcampDailyPath(path, context).then(
            async (album) => {
              if (!album) {
                return album
              }

              return {
                ...album,
                bandcampDailyURL: bandcampDailyBase + path,
              }
            }
          )
        )
      )
    }

    const albums = await Promise.all(promises)

    prisma.$transaction(async (txn) => {
      let inserted = 0
      await Promise.all(
        albums
          .filter((album): album is DailyBandcampAlbum => !!album)
          .map(async (album) => {
            const data = {
              albumID: album.raw.id.toString(),
              album: album.title,
              artistID: album.raw.art_id.toString(),
              artist: album.artist,
              imageURL: album.imageUrl,
              url: album.url,
              bandcampDailyURL: album.bandcampDailyURL,
            }

            try {
              return txn.bandcampDailyAlbum
                .create({ data })
                .then(() => inserted++)
            } catch (e) {
              return txn.bandcampDailyAlbum.update({
                data,
                where: {
                  albumID: data.albumID,
                },
              })
            }
          })
      )

      logger.info({
        message: 'finished inserting albums',
        inserted,
      })
    })
  } finally {
    await browser.close()
  }
}

const getAlbumInfoFromBandcampDailyPath = dailyLimiter.wrap(
  async (path: string, context: BrowserContext) => {
    logger.info({
      message: 'fetching album info',
      url: bandcampDailyBase + path,
    })
    const page = await context.newPage()

    try {
      await page.goto(bandcampDailyBase + path)

      try {
        var albumURL = await page
          .locator(
            'mplayer > mplayer-inner > div.mptext > span.mpalbuminfo > a.mptralbum'
          )
          .getAttribute('href')

        if (!albumURL) {
          console.error(
            `could not find album link for Bandcamp Daily '${
              bandcampDailyBase + path
            }'`
          )
          return false
        }
      } catch (e) {
        console.error(
          `could not locate album link on ${bandcampDailyBase + path}`
        )
        return false
      }

      return bandcamp.getAlbum(albumURL)
    } catch (e) {
      console.error(`could not fetch album for ${bandcampDailyBase + path}`, e)
      return false
    } finally {
      await page.close()
    }
  }
)

scrape()
