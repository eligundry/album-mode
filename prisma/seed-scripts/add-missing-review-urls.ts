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
      message: 'What hostname should we search DuckDuckGo for?',
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

  const duckDuckGoUpdateAlbum = async (
    album: AlbumReviewedByPublication,
    hostname: string
  ) => {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
    })
    const page = await context.newPage()
    const url = new URL('https://duckduckgo.com/')
    url.searchParams.set('q', `${album.album} ${album.artist} site:${hostname}`)
    await page.goto(url.toString())
    const linksLocator = page.locator(
      `#links h2 a[href*="https://${hostname}"]`
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
          message: `Could not search DuckDuckGo for ${album.album} by ${album.artist}. Do you want to enter URL manually?`,
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
      .catch(async (error) => {
        if (error.message.includes('slug')) {
          await prisma.albumReviewedByPublication.update({
            data: {
              slug: link + `#${album.id}`,
            },
            where: {
              id: album.id,
            },
          })

          return
        }

        console.error(error)
        return duckDuckGoUpdateAlbum(album, hostname)
      })

    await context.close()
  }

  for (let album of reviews) {
    await duckDuckGoUpdateAlbum(album, hostname)
  }
}

main()
