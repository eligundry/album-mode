import axios from 'axios'
import { JSDOM } from 'jsdom'
import trim from 'lodash/trim'
import { stripHtml } from 'string-strip-html'
import { TextDecoder } from 'util'

import { constructLogger } from '~/lib/logging.server'

import { IScraperArgs } from '../types'

interface ChristgauItem {
  album: string
  artist: string
  url: string
}

type IChristgauScrapeArgs = IScraperArgs<ChristgauItem>

const cleanAlbumTitle = (title: string) => title.replaceAll('. . .', '...')
const logger = constructLogger()
const axiosChristgau = axios.create({
  baseURL: 'https://www.robertchristgau.com/xg/pnj/',
  responseType: 'arraybuffer',
  responseEncoding: 'binary',
  transformResponse: (data) => {
    const decoder = new TextDecoder('ISO-8859-1')
    return decoder.decode(data)
  },
})

const scrapePazzAndJop = async ({ onWrite }: IChristgauScrapeArgs) => {
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

  let albumCount = 0

  for (const path of criticsPollURLs) {
    const { data: html } = await axiosChristgau.get(path)
    const document = new JSDOM(html).window.document
    const albumSelector = document.querySelectorAll(
      'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > p:nth-child(4) > table tr td[align=left]',
    )

    for (const td of albumSelector) {
      const albumName = cleanAlbumTitle(
        td.querySelector('i')?.textContent ?? '',
      )

      if (!albumName) {
        continue
      }

      const artistName =
        trim(
          td.querySelector('b')?.textContent?.replace(albumName, '') ?? '',
          ': ',
        ) ?? albumName

      let slug = new URL('https://www.robertchristgau.com/get_artist.php')
      slug.searchParams.set('name', artistName)
      slug.hash = `:~:text=${albumName}`
      await onWrite({
        album: albumName,
        artist: artistName,
        url: slug.toString(),
      })
      albumCount++
    }
  }

  logger.info({
    message: 'finished scraping pazz & jop critics polls',
    albumCount,
  })
}

const scrapePazzAndJopDeansLists = async ({
  onWrite,
}: IChristgauScrapeArgs) => {
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

  let albumCount = 0

  // Next, we must pull the artist and album names from the pages and insert
  // them into the DB.
  for (const path of deansListURLs) {
    const { data: html } = await axiosChristgau.get(path)
    const document = new JSDOM(html).window.document
    const htmlAlbumList = document.querySelector(
      'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > ol',
    )

    if (!htmlAlbumList) {
      logger.warn({
        message: 'could not pull htmlAlbumList',
        path,
      })
      continue
    }

    const htmlAlbums = htmlAlbumList.querySelectorAll('li')

    for (
      let i = 0, li = htmlAlbums[0];
      i < htmlAlbums.length;
      li = htmlAlbums[++i]
    ) {
      const htmlAlbum = li.querySelector('i')?.innerHTML

      if (!htmlAlbum) {
        console.warn({
          message: 'could not pull album from li',
          index: i,
          path,
          html: li.innerHTML,
        })
        continue
      }

      const album = trim(cleanAlbumTitle(stripHtml(htmlAlbum).result))
      let artist = album

      const htmlArtist = li.querySelector('b')?.innerHTML?.split(': ')?.[0]

      if (htmlArtist) {
        artist = trim(stripHtml(htmlArtist).result)
      }

      let slug = new URL('https://www.robertchristgau.com/get_artist.php')
      slug.searchParams.set('name', artist)
      slug.hash = `:~:text=${album}`

      const albumReviewURL = li
        .querySelector('a[href*="get_album.php"]')
        ?.getAttribute('href')

      if (albumReviewURL) {
        slug = new URL('https://www.robertchristgau.com' + albumReviewURL)
      }

      await onWrite({
        album,
        artist,
        url: slug.toString(),
      })
      albumCount++
    }
  }

  logger.info('finished scraping deans lists', { albumCount })
}

const api = { scrapePazzAndJop, scrapePazzAndJopDeansLists }
export default api
