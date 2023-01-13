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
  responseType: 'arraybuffer',
  responseEncoding: 'binary',
  transformResponse: (data) => {
    const decoder = new TextDecoder('ISO-8859-1')
    return decoder.decode(data)
  },
})

interface Album {
  album: string
  artist: string
  slug: string
}

const cleanAlbumTitle = (title: string) => title.replaceAll('. . .', '...')

const seedPazzAndJop = async () => {
  // First, we must fetch the listing page to get all the links
  const criticsPollURLs = await axiosChristgau
    .get('')
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
  const albums = await Promise.all(
    criticsPollURLs.flatMap(async (path) => {
      const { data: html } = await axiosChristgau.get(path)
      const document = new JSDOM(html).window.document
      const albums: Album[] = []

      document
        .querySelectorAll(
          'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > p:nth-child(4) > table tr td[align=left]'
        )
        .forEach((td) => {
          const albumName = cleanAlbumTitle(
            td.querySelector('i')?.textContent ?? ''
          )

          if (!albumName) {
            return
          }

          const artistName =
            trim(
              td.querySelector('b')?.textContent?.replace(albumName, '') ?? '',
              ': '
            ) ?? albumName

          let slug = new URL('https://www.robertchristgau.com/get_artist.php')
          slug.searchParams.set('name', artistName)
          slug.hash = kebabCase(`${artistName} ${albumName}`)

          albums.push({
            album: albumName,
            artist: artistName,
            slug: slug.toString(),
          })
        })

      await Promise.all(
        albums.map(async (data) =>
          prisma.albumReviewedByPublication
            .create({
              data: {
                publicationID: 1,
                ...data,
              },
            })
            .then(() => inserted++)
            .catch(() => {})
        )
      )

      return albums
    })
  )

  logger.info({
    message: 'finished scraping pazz & jop critics polls',
    inserted,
    albums,
  })
}

const seedPazzAndJopDeansLists = async () => {
  const deansListURLs = await axiosChristgau
    .get('')
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
  const albums = await Promise.all(
    deansListURLs.flatMap(async (path) => {
      const { data: html } = await axiosChristgau.get(path)
      const document = new JSDOM(html).window.document
      const albums: Album[] = []
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

        const album = trim(cleanAlbumTitle(stripHtml(htmlAlbum).result))
        let artist = album

        const htmlArtist = li.querySelector('b')?.innerHTML?.split(': ')?.[0]

        if (htmlArtist) {
          artist = trim(stripHtml(htmlArtist).result)
        }

        const slugURL = new URL(
          'https://www.robertchristgau.com/get_artist.php'
        )
        slugURL.searchParams.set('name', artist)
        slugURL.hash = kebabCase(`${artist} ${album}`)
        let slug = slugURL.toString()

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

      await Promise.all(
        albums.map(async (data) =>
          prisma.albumReviewedByPublication
            .create({
              data: {
                publicationID: 1,
                ...data,
              },
            })
            .then(() => inserted++)
            .catch(() => {})
        )
      )

      return albums
    })
  )

  logger.info({
    message: 'finished scriping pazz & jop deans lists',
    inserted,
    albums,
  })
}

seedPazzAndJop()
seedPazzAndJopDeansLists()
