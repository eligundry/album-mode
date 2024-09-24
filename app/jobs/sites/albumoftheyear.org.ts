import random from 'lodash/random'
import { setTimeout } from 'node:timers/promises'
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
  startPage?: number
}

// Use to scrape pages like https://www.albumoftheyear.org/publication/1-pitchfork/reviews/
async function scrapeReviewsGallery({
  slug,
  startPage = 1,
  onWrite,
}: IScrapeReviewsGallery) {
  const browser = await chromium.launch()
  const logger = constructLogger().child({ slug })

  try {
    for (
      let pageNum = startPage, shouldContinue = true;
      shouldContinue;
      pageNum++
    ) {
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
      logger.info('attempting to write albums', {
        pageNum,
        count: albumBlocks.length,
      })

      for (const block of albumBlocks) {
        const artist = await block.locator('.artistTitle').textContent()
        const album = await block.locator('.albumTitle').textContent()
        const score = await block
          .locator('.rating')
          .textContent({ timeout: 100 })
          .catch(() => undefined)
          .then(Number)
        let reviewURL = await block
          .locator('.ratingText a')
          .getAttribute('href', { timeout: 100 })
          .catch(() => undefined)

        if (!reviewURL) {
          continue
        }

        if (!reviewURL.startsWith('http')) {
          logger.warn('invalid url', {
            reviewURL,
            url,
            pageNum,
            artist,
            album,
          })
          continue
        }

        if (album && artist && reviewURL) {
          const item = {
            album,
            artist,
            score,
            url: reviewURL,
          }
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
      await setTimeout(random(1, 5) * 1000)
    }
  } finally {
    await browser.close()
  }
}

// https://www.albumoftheyear.org/list/1107-pitchforks-50-best-albums-of-2018/
async function scrapeList({ slug, onWrite }: IScrapeReviewsGallery) {
  const browser = await chromium.launch()
  const logger = constructLogger().child({ slug })

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
        let reviewURL = await block
          .locator('.albumListBlurbLink a')
          .getAttribute('href', { timeout: 100 })
          .catch(() => undefined)

        // Not all list items have a review URL. In that event, link to the
        // list item on albumoftheyear.org
        if (!reviewURL || !reviewURL.startsWith('http')) {
          const selfURL = new URL(url.toString())
          selfURL.hash = `:~:text=${album}`
          reviewURL = selfURL.toString()
        }

        if (album && artist && url) {
          const item = { album, artist, url: reviewURL }
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
      await setTimeout(random(1, 5) * 1000)
    }
  } finally {
    await browser.close()
  }
}

const api = { scrapeReviewsGallery, scrapeList }
export default api
