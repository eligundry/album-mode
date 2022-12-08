import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import kebabCase from 'lodash/kebabCase'
import retry from 'async-retry'
import logger from '~/lib/logging.server'

const prisma = new PrismaClient()

type DataMap = Record<
  string,
  {
    artist: string
    reviewURL: string
  }
>

const needleDrop = async () => {
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

  if (!publication) {
    throw new Error('could not create or fetch publication')
  }

  const albumArtistMap: DataMap = {}
  const browser = await chromium.launch()
  let scoresAboveSix = true
  let shouldContinue = true
  let pageNum = 1

  try {
    while (scoresAboveSix && shouldContinue) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
      })
      const page = await context.newPage()
      const url = `https://www.albumoftheyear.org/ratings/57-the-needle-drop-highest-rated/all/${pageNum}`
      const response = await retry((_, attempt) => {
        logger.log({
          level: 'info',
          message: 'fetching albumoftheyear.org page',
          url,
          attempt,
        })
        return page.goto(url, {
          timeout: 60 * 1000,
          waitUntil: 'domcontentloaded',
        })
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
        const row = reviewRows.nth(i)
        const artistAlbum = await row.locator('.albumListTitle a').textContent()
        const reviewURL = await row.locator('.scoreText a').getAttribute('href')
        const score = parseInt(
          (await row.locator('.scoreValue').textContent()) ?? '0'
        )

        if (!artistAlbum || !reviewURL) {
          logger.log({
            level: 'warn',
            message: 'could not pull data from row',
            index: i,
          })
          continue
        }

        if (score < 60) {
          scoresAboveSix = false
          logger.log({
            level: 'info',
            message: 'score is below 6, finishing fetching reviews',
          })
          break
        }

        const [artist, album] = artistAlbum.split(' - ')
        const uniqueURL = new URL(reviewURL)
        uniqueURL.searchParams.set('utm_source', 'album-mode.party')
        uniqueURL.searchParams.set('utm_term', kebabCase(artistAlbum))

        albumArtistMap[album] = {
          artist,
          reviewURL: uniqueURL.toString(),
        }
      }

      await page.close()
      await context.close()
      pageNum++
    }
  } finally {
    await browser.close()
  }

  let inserted = 0

  await Promise.all(
    Object.entries(albumArtistMap).map(([album, { artist, reviewURL }]) =>
      prisma.albumReviewedByPublication
        .create({
          data: {
            publicationID: publication.id,
            album: album,
            artist: artist,
            slug: reviewURL,
          },
        })
        .then(() => inserted++)
        .catch(() => {})
    )
  )

  logger.log({
    level: 'info',
    message: 'finished inserting albums',
    inserted,
  })
}

needleDrop()
