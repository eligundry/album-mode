import { PrismaClient } from '@prisma/client'
import kebabCase from 'lodash/kebabCase'
import { chromium } from 'playwright'
import yargs from 'yargs'

interface Options {
  listID: string
  name: string
  slug: string
  url?: string
  singlePage?: boolean
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
      const response = await page.goto(url, {
        timeout: 60 * 1000,
        waitUntil: 'domcontentloaded',
      })

      if (!response) {
        shouldContinue = false
        continue
      }

      if (
        response.status() !== 200 ||
        (!options.singlePage && !response.url().endsWith(pageNum.toString()))
      ) {
        console.error(`could not fetch ${url}`, await page.innerHTML('body'))
        shouldContinue = false
        continue
      }

      // we were redirected, bail
      if (!options.singlePage && response.url() !== url) {
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

      if (options.singlePage) {
        shouldContinue = false
      }
    }
  } finally {
    await browser.close()
  }

  const publication = await prisma.publication
    .create({
      data: {
        name: options.name,
        slug: options.slug,
        url: options.url,
      },
    })
    .catch(() =>
      prisma.publication.findFirst({
        where: {
          slug: options.slug,
        },
      })
    )

  if (!publication) {
    throw new Error('could not fetch or create publication')
  }

  await Promise.all(
    Object.entries(albumArtistMap).map(([album, artist]) =>
      prisma.albumReviewedByPublication.create({
        data: {
          publicationID: publication.id,
          album: album,
          artist: artist,
          slug: `albumoftheyear.org/list/${options.listID}#${kebabCase(
            `${album}-${artist}`
          )}`,
        },
      })
    )
  )

  console.log(albumArtistMap)
}

const main = async () => {
  const args = await yargs
    .scriptName('album-of-the-year')
    .usage('$0 --listID <string> --name <string> --slug <string>')
    .option('listID', {
      describe: 'The slug of the list on albumoftheyear.org',
      type: 'string',
    })
    .option('name', {
      describe: 'The human readable name of the list',
      type: 'string',
    })
    .option('slug', {
      describe: 'The slug of the list on the site',
      type: 'string',
    })
    .option('url', {
      describe: 'URL of the publication',
      type: 'string',
    })
    .option('singlePage', {
      describe: 'Is the list a single page?',
      type: 'boolean',
    })
    .demandOption(['listID', 'slug', 'name'])
    .help().argv

  await seedAlbumOfTheYear(args)
}

main()
