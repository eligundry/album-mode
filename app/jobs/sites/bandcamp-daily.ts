import Bottleneck from 'bottleneck'
import { BrowserContext, chromium } from 'playwright'

import bandcamp from '~/lib/bandcamp.server'
import { constructLogger } from '~/lib/logging.server'
import { BandcampAlbum } from '~/lib/types/bandcamp'

import { IScraperArgs } from '../types'

type DailyBandcampAlbum = BandcampAlbum & {
  bandcampDailyURL: string
}

type IScrapeBandcampDaily = IScraperArgs<DailyBandcampAlbum>

const logger = constructLogger()
const bandcampDailyBase = 'https://daily.bandcamp.com'
const bandcampDailyURL = new URL('https://daily.bandcamp.com/album-of-the-day')
const dailyLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000 * 3,
})

const scrape = async ({ onWrite }: IScrapeBandcampDaily) => {
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext()

    for (
      let pageNumber = 1, shouldContinue = true;
      shouldContinue;
      pageNumber++
    ) {
      const page = await context.newPage()
      const url = new URL(bandcampDailyURL.toString())
      url.searchParams.set('page', pageNumber.toString())
      logger.info({
        message: 'fetching bandcamp daily listing page',
        url: url.toString(),
        pageNumber,
      })
      const response = await page.goto(bandcampDailyURL.toString())

      if (!response || !response.ok) {
        logger.warn('no response, terminating fetching loop', {
          url: url.toString(),
        })
        shouldContinue = false
        continue
      }

      let paths: string[] = []
      const linkElms = page.locator(
        ".album-of-the-day .list-article.aotd a.title[href*='/album-of-the-day/']",
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
        logger.warn('no paths, terminating fetching loop', {
          url: url.toString(),
        })
        shouldContinue = false
        continue
      }

      logger.info('fetching album info for paths', { paths })

      for (const path of paths) {
        const album = await getAlbumInfoFromBandcampDailyPath(path, context)

        if (!album) {
          logger.warn('could not fetch album', { path })
          continue
        }

        shouldContinue = await onWrite({
          ...album,
          bandcampDailyURL: bandcampDailyBase + path,
        })

        if (!shouldContinue) {
          logger.info('exiting fetching loop, onWrite returned false', {
            album,
            url,
          })
          break
        }
      }
    }
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
            'mplayer > mplayer-inner > div.mptext > span.mpalbuminfo > a.mptralbum',
          )
          .getAttribute('href')

        if (!albumURL) {
          console.error(
            `could not find album link for Bandcamp Daily '${
              bandcampDailyBase + path
            }'`,
          )
          return false
        }
      } catch (e) {
        console.error(
          `could not locate album link on ${bandcampDailyBase + path}`,
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
  },
)

const api = { scrape }
export default api
