import { chromium } from 'playwright'

import { constructConsoleDatabase } from '~/lib/database/index.server'
import { urlWithUTMParams } from '~/lib/queryParams'

// Pulls albums from the US version of 33 1/3.
const bloomsburyScraper = async (storeSlug: string) => {
  const { model } = constructConsoleDatabase()
  const publication = await model.getOrCreatePublication({
    name: '33 ⅓ Sound',
    slug: '33-13-sound',
    service: 'publication',
    metadata: {
      url: 'https://333sound.com/33-13-series/',
    },
  })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
  })
  const page = await context.newPage()

  try {
    const storeBaseURL = `https://www.bloomsbury.com/us/series/${storeSlug}`
    console.log(`fetching ${storeBaseURL}`)
    const response = await page.goto(storeBaseURL, {
      waitUntil: 'domcontentloaded',
    })

    if (!response || !response.ok) {
      console.error('could not fetch US version of site', response)
      return
    }

    let shouldContinue = true
    let pageIdx = 1

    do {
      console.log(`fetching page ${pageIdx++}`)

      const items = page.locator(
        '.search-results-list .product-listing-item .product-listing-item__info--title > a',
      )
      const itemsCount = await items.count()

      for (let i = 0; i < itemsCount; i++) {
        const item = items.nth(i)
        const innerText = await item.innerText()
        const matches = innerText.match(/(.*)[’']s? (.*)/)
        const artist = matches?.[1]
        const album = matches?.[2]
        const urlPath = await item.getAttribute('href')

        if (!artist || !album || !urlPath) {
          console.error('could not pull info for item', { innerText })
          continue
        }

        if (pageIdx === 15) {
          console.log('what the fuck is up', page.url())
          console.log({ album, artist, urlPath })
        }

        const slug = urlWithUTMParams('https://www.bloomsbury.com' + urlPath, {
          term: '33-13',
        })

        model
          .insertReviewedItem({
            reviewerID: publication.id,
            reviewURL: slug.toString(),
            name: album,
            creator: artist,
          })
          .catch()
      }

      try {
        await page
          .locator(
            '#search-header .pagination:first-of-type li:not(.disabled):last-child > button',
          )
          .click()
      } catch (e) {
        shouldContinue = false
      }
    } while (shouldContinue)
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

const main = async () => {
  await bloomsburyScraper('33-13')
  await bloomsburyScraper('33-13-japan')
  await bloomsburyScraper('33-13-brazil')
  await bloomsburyScraper('33-13-europe')
}

main()
