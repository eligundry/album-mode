import dotenv from 'dotenv'
import { and, eq, notLike, sql } from 'drizzle-orm'
import inquirer from 'inquirer'
import { chromium } from 'playwright'

import {
  ReviewedItem,
  db,
  reviewedItems,
  reviewers,
} from '~/lib/database/index.server'

dotenv.config()

const main = async () => {
  const publications = db
    .select()
    .from(reviewers)
    .where(eq(reviewers.service, 'publication'))
    .orderBy(reviewers.name)
    .all()

  const { publicationName, hostname } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'publicationName',
      message: 'Which publication?',
      choices: publications.map((p) => ({
        key: p.id,
        value: p.name,
      })),
    },
    {
      type: 'input',
      name: 'hostname',
      message: 'What hostname should we search DuckDuckGo for?',
    },
  ])

  const reviews = db
    .select({
      id: reviewedItems.id,
      createdAt: reviewedItems.createdAt,
      updatedAt: reviewedItems.updatedAt,
      reviewURL: reviewedItems.reviewURL,
      reviewerID: reviewedItems.reviewerID,
      name: reviewedItems.name,
      creator: reviewedItems.creator,
      service: reviewedItems.service,
      resolvable: reviewedItems.resolvable,
      metadata: reviewedItems.metadata,
    })
    .from(reviewedItems)
    .innerJoin(
      reviewers,
      and(
        eq(reviewers.name, publicationName),
        eq(reviewers.id, reviewedItems.reviewerID)
      )
    )
    .where(
      and(
        notLike(reviewedItems.reviewURL, 'https://%'),
        sql`COALESCE(json_extract(${reviewedItems.metadata}, '$.reviewUnresolvable'), 0) != 1`
      )
    )
    .orderBy(reviewedItems.id)
    .all()

  if (!reviews.length) {
    console.log('No reviews to update.')
    return
  }

  console.log(`Found ${reviews.length} reviews to update.`)

  const browser = await chromium.launch()

  const duckDuckGoUpdateAlbum = async (
    album: ReviewedItem,
    hostname: string
  ): Promise<any> => {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
    })
    const page = await context.newPage()
    const url = new URL('https://duckduckgo.com/')
    url.searchParams.set('q', `${album.name} ${album.creator} site:${hostname}`)
    await page.goto(url.toString())
    const linksLocator = page.locator(
      `.react-results--main h2 a[href*="https://${hostname}"]`
    )

    try {
      await linksLocator.first().waitFor({
        timeout: 5 * 1000,
      })
    } catch (e) {
      console.error(e)
      console.log(page.url())
      const { action } = await inquirer.prompt([
        {
          type: 'input',
          name: 'action',
          message: `Could not search DuckDuckGo for ${album.name} by ${album.creator}. Do you want to enter URL manually?`,
        },
      ])

      let data: Partial<ReviewedItem> = {
        metadata: {
          ...album.metadata,
          reviewUnresolvable: true,
        },
      }

      if (action?.startsWith('https://')) {
        data.reviewURL = action as string
      }

      db.update(reviewedItems)
        .set(data)
        .where(eq(reviewedItems.id, album.id))
        .run()

      return
    }

    const linkElms = await linksLocator.all()
    const options: { title: string; link: string }[] = []

    for (let el of linkElms) {
      const link = await el.getAttribute('href')
      const title = await el.textContent()

      if (!link || !title) {
        continue
      }

      options.push({ title, link })
    }

    const { link } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'link',
        message: `Which link for ${album.name} by ${album.creator}`,
        choices: [
          ...options.map((res) => ({
            name: `[${res.title}](${res.link})`,
            value: res.link,
          })),
          {
            name: 'Skip',
            value: '',
          },
        ],
      },
    ])

    if (!link) {
      db.update(reviewedItems)
        .set({
          metadata: {
            ...album.metadata,
            reviewUnresolvable: true,
          },
        })
        .where(eq(reviewedItems.id, album.id))
        .run()

      return
    }

    try {
      return db
        .update(reviewedItems)
        .set({ reviewURL: link })
        .where(eq(reviewedItems.id, album.id))
        .run()
    } catch (e) {
      if (e instanceof Error && e.message.includes('reviewURL')) {
        return db
          .update(reviewedItems)
          .set({ reviewURL: link + `#${album.id}` })
          .where(eq(reviewedItems.id, album.id))
          .run()
      }

      console.error(e)
      return duckDuckGoUpdateAlbum(album, hostname)
    } finally {
      await context.close()
    }
  }

  for (let album of reviews) {
    await duckDuckGoUpdateAlbum(album, hostname)
  }
}

main()
