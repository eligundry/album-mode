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
    let pageNum = 1
    const url = new URL('https://ra.co/reviews/albums')
    url.searchParams.set('page', pageNum.toString())
    await page.goto(url.toString())
    let shouldContinue = true

    // Get all albums listed
    while (shouldContinue) {
      const elms = await page.locator('[data-testid=monthly-list] > [pb]').all()

      for (const elm of elms.slice(-20)) {
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

      if (!shouldContinue) {
        break
      }

      await page.getByText('Load More').click()
      url.searchParams.set('page', (++pageNum).toString())
      await page.waitForURL(url.toString())
      await page.waitForTimeout(3000)
      logger.info('navigating to next page', { url: page.url() })
    }
  } finally {
    await browser.close()
  }
}

const api = { scrape }

export default api
