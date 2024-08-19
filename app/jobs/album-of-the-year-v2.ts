import { chromium } from 'playwright'

interface AlbumOfTheYearItem {
  album: string
  artist: string
  score?: number
  url: string
}

interface IScrapeReviewsGallery {
  slug: string
  onShouldContinue: (item: AlbumOfTheYearItem) => Promise<boolean>
  onWrite: (item: AlbumOfTheYearItem) => Promise<void>
}

// Use to scrape pages like https://www.albumoftheyear.org/publication/1-pitchfork/reviews/
export async function scrapeReviewsGallery({
  slug,
  onShouldContinue,
  onWrite,
}: IScrapeReviewsGallery) {
  const browser = await chromium.launch()

  try {
    for (let pageNum = 1, shouldContinue = true; shouldContinue; pageNum++) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      })
      const page = await context.newPage()
      const url = new URL(
        `https://www.albumoftheyear.org/publication/${slug}/reviews/${pageNum}`,
      )

      console.log(`fetching ${url}`)
      const response = await page.goto(url.toString(), {
        timeout: 60 * 1000,
        waitUntil: 'domcontentloaded',
      })

      if (!response) {
        console.warn('no response')
        shouldContinue = false
        continue
      }

      if (response.status() !== 200) {
        console.error(`could not fetch ${url}`, await page.innerHTML('body'))
        shouldContinue = false
        continue
      }

      // we were redirected, bail
      if (response.url() !== url.toString()) {
        shouldContinue = false
        continue
      }

      const albumBlocks = await page.locator('.albumBlock').all()

      for (const block of albumBlocks) {
        const artist = await block.locator('.artistTitle').textContent()
        const album = await block.locator('.albumTitle').textContent()
        const score = await block.locator('.rating').textContent()
        const url = await block.locator('.ratingText a').getAttribute('href')

        if (album && artist && url) {
          const item = { album, artist, score: Number(score), url }
          shouldContinue = await onShouldContinue(item)
          if (shouldContinue) {
            await onWrite(item)
          } else {
            shouldContinue = false
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

const api = { scrapeReviewsGallery }
export default api
