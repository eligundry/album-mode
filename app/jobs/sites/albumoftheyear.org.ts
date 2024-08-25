import { chromium } from 'playwright'

import { constructLogger } from '~/lib/logging.server'

import { IScraperArgs } from '../types'

interface AlbumOfTheYearItem {
  album: string
  artist: string
  score?: number
  url: string
}

interface IScrapeReviewsGallery extends IScraperArgs<AlbumOfTheYearItem> {
  slug: string
}

const logger = constructLogger()

// Use to scrape pages like https://www.albumoftheyear.org/publication/1-pitchfork/reviews/
async function scrapeReviewsGallery({ slug, onWrite }: IScrapeReviewsGallery) {
  const browser = await chromium.launch()

  try {
    for (let pageNum = 1, shouldContinue = true; shouldContinue; pageNum++) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      })
      const page = await context.newPage()
      const url = new URL(
        `https://www.albumoftheyear.org/publication/${slug}/reviews/${pageNum > 1 ? pageNum + '/' : ''}?sort=added`,
      )

      logger.info('fetching albumoftheyear.org page', { url, pageNum })
      const response = await page.goto(url.toString(), {
        timeout: 60 * 1000,
        waitUntil: 'domcontentloaded',
      })

      if (!response) {
        logger.warn('no response, terminating fetching loop', { url, pageNum })
        shouldContinue = false
        continue
      }

      if (response.status() !== 200) {
        logger.error('could not fetch, terminating fetching loop', {
          url,
          pageNum,
          pageHtml: await page.innerHTML('body'),
        })
        shouldContinue = false
        continue
      }

      // we were redirected, bail
      if (response.url() !== url.toString()) {
        shouldContinue = false
        continue
      }

      const albumBlocks = await page.locator('.albumBlock').all()
      logger.info('attempting to write albums', { count: albumBlocks.length })

      for (const block of albumBlocks) {
        const artist = await block.locator('.artistTitle').textContent()
        const album = await block.locator('.albumTitle').textContent()
        const score = await block.locator('.rating').textContent()
        const url = await block.locator('.ratingText a').getAttribute('href')

        if (album && artist && url) {
          const item = { album, artist, score: Number(score), url }
          shouldContinue = await onWrite(item)

          if (!shouldContinue) {
            logger.info('exiting fetching loop, onWrite returned false', {
              item,
              url,
              pageNum,
            })
            break
          }
        }
      }

      await page.close()
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

// https://www.albumoftheyear.org/list/1107-pitchforks-50-best-albums-of-2018/
async function scrapeList({ slug, onWrite }: IScrapeReviewsGallery) {
  const browser = await chromium.launch()

  try {
    for (let pageNum = 1, shouldContinue = true; shouldContinue; pageNum++) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      })
      const page = await context.newPage()
      const url = new URL(
        `https://www.albumoftheyear.org/list/${slug}/${pageNum}`,
      )

      logger.info('fetching albumoftheyear.org page', { url, pageNum })
      const response = await page.goto(url.toString(), {
        timeout: 60 * 1000,
        waitUntil: 'domcontentloaded',
      })

      if (!response) {
        logger.warn('no response, terminating fetching loop', { url, pageNum })
        shouldContinue = false
        continue
      }

      if (response.status() !== 200) {
        logger.error('could not fetch, terminating fetching loop', {
          url,
          pageNum,
          pageHtml: await page.innerHTML('body'),
        })
        shouldContinue = false
        continue
      }

      // we were redirected, bail
      if (response.url() !== url.toString()) {
        shouldContinue = false
        continue
      }

      const albumBlocks = await page.locator('.albumListRow').all()
      logger.info('attempting to write albums', { count: albumBlocks.length })

      for (const block of albumBlocks) {
        const artistAlbum = await block
          .locator('.albumListTitle a')
          .textContent()

        if (!artistAlbum) {
          logger.warn('no artistAlbum', { block })
          continue
        }

        const [artist, album] = artistAlbum.split(' - ')
        const url = await block
          .locator('.albumListBlurbLink a')
          .getAttribute('href')

        if (album && artist && url) {
          const item = { album, artist, url }
          shouldContinue = await onWrite(item)

          if (!shouldContinue) {
            logger.info('exiting fetching loop, onWrite returned false', {
              item,
              url,
              pageNum,
            })
            break
          }
        }
      }

      await page.close()
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

const api = { scrapeReviewsGallery, scrapeList }
export default api
