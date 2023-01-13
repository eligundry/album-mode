import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import kebabCase from 'lodash/kebabCase'
import trim from 'lodash/trim'
import { stripHtml } from 'string-strip-html'
import { TextDecoder } from 'util'

import logger from '~/lib/logging.server'

const prisma = new PrismaClient()
const axiosChristgau = axios.create({
  baseURL: 'https://www.robertchristgau.com/xg/pnj/',
})

interface Albums {
  album: string
  artist: string
  slug: string
}

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

  logger.info({
    message: 'found pazz & jop critics poll urls',
    criticsPollURLs,
  })

  let inserted = 0

  // Next, we must pull the artist and album names from the pages and insert
  // them into the DB.
  await Promise.all(
    criticsPollURLs.flatMap((path) =>
      axiosChristgau
        .get(path, {
          responseType: 'document',
        })
        .then((resp) => {
          const decoder = new TextDecoder('ISO-8859-1')
          return decoder.decode(resp.data)
        })
        .then((html) => new JSDOM(html).window.document)
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
              prisma.albumReviewedByPublication
                .create({
                  data: {
                    publicationID: 1,
                    album,
                    artist: artist,
                    slug: `/christgau/${path}#${kebabCase(
                      `${artist} ${album}`
                    )}`,
                  },
                })
                .then(() => inserted++)
                .catch(() => {})
            )
          )
        })
    )
  )

  logger.info({
    message: 'finished scraping pazz & jop critics polls',
    inserted,
  })
}

const seedPazzAndJopDeansLists = async () => {
  const deansListURLs = await axiosChristgau
    .get('', {
      responseType: 'document',
    })
    .then(({ data: html }) => new JSDOM(html).window.document)
    .then((document) => {
      const paths: string[] = []

      document
        .querySelectorAll('a[href*=deans]')
        // @ts-ignore
        .forEach((a) => paths.push(a.href as string))

      return paths
    })

  logger.info({
    message: 'found deans list urls',
    deansListURLs,
  })

  let inserted = 0

  // Next, we must pull the artist and album names from the pages and insert
  // them into the DB.
  await Promise.all(
    deansListURLs.flatMap(
      (path) =>
        axiosChristgau
          .get(path, {
            responseType: 'arraybuffer',
            responseEncoding: 'binary',
          })
          .then((resp) => {
            const decoder = new TextDecoder('ISO-8859-1')
            return decoder.decode(resp.data)
          })
          .then((html) => new JSDOM(html).window.document)
          .then((document) => {
            const albums: Albums[] = []
            const htmlAlbumList = document.querySelector(
              'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > ol'
            )

            if (!htmlAlbumList) {
              logger.warn({
                message: 'could not pull htmlAlbumList',
                path,
              })
              return albums
            }

            htmlAlbumList.querySelectorAll('li').forEach((li, i) => {
              const htmlAlbum = li.querySelector('i')?.innerHTML

              if (!htmlAlbum) {
                console.warn({
                  message: 'could not pull album from li',
                  index: i,
                  path,
                  html: li.innerHTML,
                })
                return
              }

              const album = stripHtml(htmlAlbum).result
              let artist = album

              const htmlArtist = li
                .querySelector('b')
                ?.innerHTML?.split(': ')?.[0]

              if (htmlArtist) {
                artist = stripHtml(htmlArtist).result
              }

              let slug = `/christgau/${path}#${kebabCase(`${artist} ${album}`)}`

              const albumReviewURL = li
                .querySelector('a[href*="get_album.php"]')
                ?.getAttribute('href')

              if (albumReviewURL) {
                slug = 'https://www.robertchristgau.com' + albumReviewURL
              }

              albums.push({
                album,
                artist,
                slug,
              })
            })

            return albums
          })
          .then((albums) => console.log(albums))
      // .then((map) => {
      //   return Promise.all(
      //     Object.entries(map).map(async ([album, artist]) =>
      //       prisma.albumReviewedByPublication
      //         .create({
      //           data: {
      //             publicationID: 1,
      //             album,
      //             artist: artist,
      //             slug: `/christgau/${path}#${kebabCase(
      //               `${artist} ${album}`
      //             )}`,
      //           },
      //         })
      //         .then(() => inserted++)
      //         .catch(() => {})
      //     )
      //   )
      // })
    )
  )

  logger.info({
    message: 'finished scriping pazz & jop deans lists',
    inserted,
  })
}

// seedPazzAndJop()
seedPazzAndJopDeansLists()
