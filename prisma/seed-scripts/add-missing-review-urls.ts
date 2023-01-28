import { AlbumReviewedByPublication } from '@prisma/client'
// @ts-ignore
import googleIt from 'google-it'
import inquirer from 'inquirer'

import { prisma } from '~/lib/db.server'

const googleUpdateAlbum = async (
  album: AlbumReviewedByPublication,
  hostname: string
) => {
  const searchResults = await googleIt({
    query: `${album.album} ${album.artist}`,
    includeSites: `https://${hostname}`,
    disableConsole: true,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
  })

  const { link } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'link',
      message: `Which link for ${album.album} by ${album.artist}`,
      choices: [
        ...searchResults.map((res: any) => ({
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
}

const main = async () => {
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

  for (let album of reviews) {
    await googleUpdateAlbum(album, hostname)
  }
}

main()
