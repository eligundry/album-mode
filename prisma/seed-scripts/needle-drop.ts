import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import kebabCase from 'lodash/kebabCase'

const prisma = new PrismaClient()

type DataMap = Record<
  string,
  {
    artist: string
    reviewURL: string
  }
>

const needleDrop = async () => {
  const albumArtistMap: DataMap = {}
  const browser = await chromium.launch()

  try {
    for (
      let pageNum = 1, shouldContinue = true;
      shouldContinue && pageNum <= 72;
      pageNum++
    ) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
      })
      const page = await context.newPage()
      const url = `https://www.albumoftheyear.org/ratings/57-the-needle-drop-highest-rated/all/${pageNum}`
      console.log(`fetching ${url}`)
      const response = await page.goto(url, {
        timeout: 60 * 1000,
      })

      if (!response) {
        shouldContinue = false
        continue
      }

      if (
        response.status() !== 200 ||
        !response.url().endsWith(pageNum.toString())
      ) {
        console.error(`could not fetch ${url}`, await page.innerHTML('body'))
        shouldContinue = false
        continue
      }

      // we were redirected, bail
      if (response.url() !== url) {
        shouldContinue = false
        continue
      }

      const reviewRows = page.locator('.albumListRow')
      const reviewsCount = await reviewRows.count()

      for (let i = 0; i < reviewsCount; i++) {
        const artistAlbum = await reviewRows
          .nth(i)
          .locator('.albumListTitle a')
          .textContent()
        const reviewURL = await reviewRows
          .nth(i)
          .locator('.scoreText a')
          .getAttribute('href')

        if (!artistAlbum || !reviewURL) {
          console.warn(`could not pull data for row ${i}`)
          continue
        }

        const [artist, album] = artistAlbum.split(' - ')
        const uniqueURL = new URL(reviewURL)
        uniqueURL.searchParams.set('utm_campaign', 'album-mode.party')
        uniqueURL.searchParams.set('utm_term', kebabCase(artistAlbum))

        albumArtistMap[album] = {
          artist,
          reviewURL: uniqueURL.toString(),
        }
      }

      await page.close()
      await context.close()
    }
  } finally {
    await browser.close()
  }

  const publication = await prisma.publication
    .create({
      data: {
        name: 'Needle Drop',
        slug: 'needle-drop',
      },
    })
    .catch(() =>
      prisma.publication.findFirst({
        where: {
          slug: 'needle-drop',
        },
      })
    )

  await Promise.all(
    Object.entries(albumArtistMap).map(([album, { artist, reviewURL }]) =>
      prisma.albumReviewedByPublication.create({
        data: {
          publicationID: publication.id,
          album: album,
          artist: artist,
          slug: reviewURL,
        },
      })
    )
  )

  console.log(albumArtistMap)
}

needleDrop()
