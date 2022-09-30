import { chromium } from 'playwright'
import { PrismaClient, Publication } from '@prisma/client'

const prisma = new PrismaClient()

// Pulls albums from the US version of 33 1/3.
const US = async () => {
  const publication = (await prisma.publication
    .create({
      data: {
        name: '33 ⅓',
        slug: '33-13',
        url: 'https://333sound.com/33-13-series/',
      },
    })
    .catch(() =>
      prisma.publication.findFirst({
        where: {
          slug: '33-13',
        },
      })
    )) as Publication

  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
  })
  const page = await context.newPage()

  try {
    const response = await page.goto('https://333sound.com/33-13-series/', {
      waitUntil: 'domcontentloaded',
    })

    if (!response || !response.ok) {
      console.error('could not fetch US version of site', response)
      return
    }

    const rows = page.locator('.entry-content table tr td:nth-child(2)')
    const count = await rows.count()

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      const innerText = await row.innerText()
      const firstLine = innerText.split('\n')[0]
      const matches = innerText.match(/^\d+.[  ](.*)’s?[  ](.*)/)
      const artist = matches?.[1]
      const album = matches?.[2]
      const url = await row
        .locator('a[href*="bloomsbury.com"]:first-of-type')
        .getAttribute('href')
      console.log(firstLine, { artist, album, url })

      if (!artist || !album || !url) {
        console.error('could not pull data for line', firstLine)
        continue
      }

      const slug = new URL(url)
      slug.searchParams.set('utm_source', 'album-mode.party')
      slug.searchParams.set('utm_term', '33-13')

      await prisma.albumReviewedByPublication
        .create({
          data: {
            publicationID: publication.id,
            album,
            artist,
            slug: slug.toString(),
          },
        })
        .catch(() => {})
    }
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

const main = async () => {
  await US()
}

main()
