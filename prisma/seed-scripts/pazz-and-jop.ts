import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { JSDOM } from 'jsdom'
import trim from 'lodash/trim'
import kebabCase from 'lodash/kebabCase'

const prisma = new PrismaClient()
const axiosChristgau = axios.create({
  baseURL: 'https://www.robertchristgau.com/xg/pnj/',
})

const seedPazzAndJop = async () => {
  // First, we must fetch the listing page to get all the links
  const criticsPollURLs = await axiosChristgau
    .get<string>('')
    .then(({ data: html }) => new JSDOM(html).window.document)
    .then((document) => {
      const paths: string[] = []

      document
        .querySelectorAll('a[href*=pjres]')
        // @ts-ignore
        .forEach((a) => paths.push(a.href as string))

      return paths
    })

  // Next, we must pull the artist and album names from the pages and insert
  // them into the DB.
  await Promise.all(
    criticsPollURLs.flatMap((path) =>
      axiosChristgau
        .get(path, {
          responseType: 'document',
        })
        .then(({ data: html }) => new JSDOM(html).window.document)
        .then((document) => {
          const albumArtistMap: Record<string, string> = {}

          document
            .querySelectorAll(
              'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > p:nth-child(4) > table tr td[align=left]'
            )
            .forEach((td) => {
              const albumName = td.querySelector('i')?.textContent

              if (!albumName) {
                return
              }

              const artistName = trim(
                td.querySelector('b')?.textContent?.replace(albumName, '') ??
                  '',
                ': '
              )

              if (artistName) {
                albumArtistMap[albumName] = artistName
              }
            })

          return albumArtistMap
        })
        .then((map) => {
          return Promise.all(
            Object.entries(map).map(async ([album, artist]) =>
              prisma.albumReviewedByPublication.create({
                data: {
                  publicationID: 1,
                  album,
                  artist: artist,
                  slug: `/christgau/${path}#${kebabCase(`${artist} ${album}`)}`,
                },
              })
            )
          )
        })
    )
  )
}

seedPazzAndJop()
