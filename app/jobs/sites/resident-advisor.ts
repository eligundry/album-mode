import { chromium } from 'playwright'

import { constructLogger } from '~/lib/logging.server'

import { IScraperArgs } from '../types'

type ResidentAdvisorItem = {
  artist: string
  title: string
  url: string
  raRecommends: boolean
}

const logger = constructLogger()

const scrape = async ({ onWrite }: IScraperArgs<ResidentAdvisorItem>) => {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  })

  try {
    const page = await context.newPage()
    await page.goto('https://ra.co/reviews/albums')
    let shouldContinue = true

    // Get all albums listed
    while (shouldContinue) {
      const elms = await page.locator('[data-testid=monthly-list] > [pb]').all()

      for (const elm of elms) {
        try {
          const artistAlbum = await elm.locator('h3').textContent()

          if (!artistAlbum) {
            continue
          }

          const [artist, album] = artistAlbum.split(' - ')
          const url = await elm.locator('h3 a').getAttribute('href')
          const raRecommends = await elm.getByText('RA Recommends').isVisible()
          shouldContinue = await onWrite({
            artist,
            title: album,
            url: url!,
            raRecommends,
          })

          if (!shouldContinue) {
            break
          }
        } catch (e) {
          logger.warn('Error scraping album', { error: e })
        }
      }

      await page.getByText('Load More').click()
      await page.waitForNavigation()
      logger.info('navigating to next page', { url: page.url() })
    }
  } finally {
    await browser.close()
  }
}

const api = { scrape }

export default api
