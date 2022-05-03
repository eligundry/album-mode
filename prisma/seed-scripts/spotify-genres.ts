import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://everynoise.com/everynoise1d.cgi?scope=all')
  const genres = await page.locator('.note a').allTextContents()

  await prisma.$transaction(async (txn) => {
    await Promise.all(
      genres.map((genre) =>
        txn.spotifyGenere.create({
          data: {
            name: genre,
          },
        })
      )
    )
  })
}

main()
