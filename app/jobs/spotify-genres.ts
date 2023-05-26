import { chromium } from 'playwright'

import {
  constructConsoleDatabase,
  spotifyGenres,
} from '~/lib/database/index.server'

const main = async () => {
  const { database } = constructConsoleDatabase()
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://everynoise.com/everynoise1d.cgi?scope=all')
  const genres = await page.locator('table .note a').allTextContents()

  let inserted = 0

  for (let genre of genres) {
    try {
      await database.insert(spotifyGenres).values({ name: genre }).run()
      inserted++
    } catch (e) {}
  }

  console.log(`inserted ${inserted} genres`)

  await browser.close()
}

main()
