import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import kebabCase from 'lodash/kebabCase'

interface Options {
  listID: string
  name: string
  slug: string
}

const prisma = new PrismaClient()

const seedAlbumOfTheYear = async (options: Options) => {
  const albumArtistMap: Record<string, string> = {}
  const browser = await chromium.launch()

  try {
    for (let pageNum = 1, shouldContinue = true; shouldContinue; pageNum++) {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
      })
      const page = await context.newPage()
      const url = `https://www.albumoftheyear.org/list/${options.listID}/${pageNum}`
      console.log(`fetching ${url}`)
      const response = await page.goto(url)

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

      await page
        .locator('.albumListTitle a')
        .allTextContents()
        .then((rawArtistAlbums) => {
          if (!rawArtistAlbums.length) {
            shouldContinue = false
            return
          }

          rawArtistAlbums.forEach((rawArtistAlbum) => {
            const [artist, album] = rawArtistAlbum.split(' - ')
            albumArtistMap[album] = artist
          })
        })

      await page.close()
      await context.close()
    }
  } finally {
    await browser.close()
  }

  const publication = await prisma.publication.create({
    data: {
      name: options.name,
      slug: options.slug,
    },
  })

  await Promise.all(
    Object.entries(albumArtistMap).map(([album, artist]) =>
      prisma.albumReviewedByPublication.create({
        data: {
          publicationID: publication.id,
          album: album,
          aritst: artist,
          slug: `albumoftheyear.com/list/${options.listID}#${kebabCase(
            `${album}-${artist}`
          )}`,
        },
      })
    )
  )

  console.log(albumArtistMap)
}

seedAlbumOfTheYear({
  listID: '1500-rolling-stones-500-greatest-albums-of-all-time-2020',
  name: 'RS Top 500',
  slug: 'rs-top-500',
})
