import { AlbumReviewedByPublication } from '@prisma/client'
import inquirer from 'inquirer'
import { chromium } from 'playwright'

import { prisma } from '~/lib/db.server'

const main = async () => {
  const browser = await chromium.launch()
  const publications = await prisma.publication.findMany({
    select: {
      id: true,
      name: true,
    },
  })

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
      message: 'What hostname should we search Google for?',
    },
  ])

  const reviews = await prisma.albumReviewedByPublication.findMany({
    where: {
      publication: {
        name: publicationName,
      },
      AND: {
        reviewUnresolvabe: false,
      },
      NOT: {
        slug: {
          startsWith: 'https://',
        },
      },
    },
  })

  const googleUpdateAlbum = async (
    album: AlbumReviewedByPublication,
    hostname: string
  ) => {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
    })
    const page = await context.newPage()
    await page.goto('https://google.com')
    await page
      .getByRole('combobox')
      .fill(`${album.album} ${album.artist} site:${hostname}`)
    await page.getByRole('button', { name: 'Google Search' }).click()

    const linksLocator = page.locator(
      `div[role="main"] a[href*="https://${hostname}"]:has(h3)`
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
          message: `Could not search Google for ${album.album} by ${album.artist}. Do you want to enter URL manually?`,
        },
      ])

      let data: Partial<AlbumReviewedByPublication> = {
        reviewUnresolvabe: true,
      }

      if (action?.startsWith('https://')) {
        data = {
          slug: action as string,
        }
      }

      await prisma.albumReviewedByPublication.update({
        data,
        where: {
          id: album.id,
        },
      })

      return
    }

    const linkElms = await linksLocator.all()
    const options: { title: string; link: string }[] = []

    for (let el of linkElms) {
      const link = await el.getAttribute('href')
      const title = await el.locator('h3').textContent()

      if (!link || !title) {
        continue
      }

      options.push({ title, link })
    }

    const { link } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'link',
        message: `Which link for ${album.album} by ${album.artist}`,
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
      await prisma.albumReviewedByPublication.update({
        data: {
          reviewUnresolvabe: true,
        },
        where: {
          id: album.id,
        },
      })

      return
    }

    await prisma.albumReviewedByPublication
      .update({
        data: {
          slug: link,
        },
        where: {
          id: album.id,
        },
      })
      .catch((error) => {
        console.error(error)
        return googleUpdateAlbum(album, hostname)
      })

    await context.close()
  }

  for (let album of reviews) {
    await googleUpdateAlbum(album, hostname)
  }
}

main()
