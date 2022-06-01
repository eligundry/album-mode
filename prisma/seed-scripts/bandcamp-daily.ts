import axios from 'axios'
import bandcamp from 'bandcamp-scraper'
import { JSDOM } from 'jsdom'
import Bottleneck from 'bottleneck'
import { PrismaClient } from '@prisma/client'
import { chromium, BrowserContext } from 'playwright'

import { BandcampAlbum } from '~/lib/types/bandcamp'

const bandcampDailyBase = 'https://daily.bandcamp.com'
const prisma = new PrismaClient()
const dailyLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000 * 3,
})
const bandcampLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000 * 3,
})
const dailyAxios = axios.create({
  baseURL: bandcampDailyBase,
  responseType: 'document',
})

type DailyBandcampAlbum = BandcampAlbum & {
  bandcampDailyURL: string
}

const scrape = async () => {
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext()
    const promises: Promise<DailyBandcampAlbum | false>[] = []

    for (let page = 1, continueFetching = true; continueFetching; page++) {
      console.info(`fetching bandcamp daily page ${page}`)

      let paths = await dailyAxios
        .get('/album-of-the-day', {
          params: {
            page,
          },
        })
        .then(({ data: html }) => new JSDOM(html).window.document)
        .then((document) => {
          const ps: string[] = []
          const links = document.querySelectorAll<HTMLAnchorElement>(
            '.album-of-the-day .list-article.aotd a.title[href*="/album-of-the-day/"'
          )
          links.forEach((link) => ps.push(link.href))
          return ps
        })
        .catch((e) => {
          if (e?.response?.statusCode === 404) {
            continueFetching = false
            return
          }

          console.error(`could not get list links for page ${page}`, e)
        })

      if (!paths?.length) {
        continueFetching = false
        continue
      }

      const pathsAlreadyFetched =
        (
          await prisma.bandcampDailyAlbum.findMany({
            select: {
              bandcampDailyURL: true,
            },
            where: {
              bandcampDailyURL: {
                in: paths.map((p) => bandcampDailyBase + p),
              },
            },
          })
        )?.map(({ bandcampDailyURL }) => bandcampDailyURL) ?? []

      if (pathsAlreadyFetched.length > 0) {
        continueFetching = false
        paths = paths.filter(
          (p) => !pathsAlreadyFetched.find((pa) => pa.endsWith(p))
        )
      }

      promises.push(
        ...paths.map((path) =>
          getAlbumInfoFromBandcampDailyPath(path, context).then(
            async (album) => {
              if (!album) {
                return album
              }

              return {
                ...album,
                bandcampDailyURL: bandcampDailyBase + path,
              }
            }
          )
        )
      )
    }

    const albums = await Promise.all(promises)
    let inserted = 0
    await Promise.all(
      albums
        .filter((album): album is DailyBandcampAlbum => !!album)
        .map((album) =>
          prisma.bandcampDailyAlbum
            .create({
              data: {
                albumID: album.raw.id,
                album: album.title,
                artistID: album.raw.art_id,
                artist: album.artist,
                url: album.url,
                bandcampDailyURL: album.bandcampDailyURL,
              },
            })
            .then(() => inserted++)
            .catch(() => {})
        )
    )
    console.log(`inserted ${inserted} albums`, albums)
  } finally {
    await browser.close()
  }
}

const getAlbumInfoFromBandcampDailyPath = dailyLimiter.wrap(
  async (path: string, context: BrowserContext) => {
    console.log(`fetching album info for ${bandcampDailyBase + path}`)
    const page = await context.newPage()

    try {
      await page.goto(bandcampDailyBase + path)

      try {
        var albumURL = await page
          .locator(
            'mplayer > mplayer-inner > div.mptext > span.mpalbuminfo > a.mptralbum'
          )
          .getAttribute('href')

        if (!albumURL) {
          console.error(
            `could not find album link for Bandcamp Daily '${
              bandcampDailyBase + path
            }'`
          )
          return false
        }
      } catch (e) {
        console.error(
          `could not locate album link on ${bandcampDailyBase + path}`
        )
        return false
      }

      return getBandcampAlbum(albumURL)
    } catch (e) {
      console.error(`could not fetch album for ${bandcampDailyBase + path}`, e)
      return false
    } finally {
      await page.close()
    }
  }
)

const getBandcampAlbum = bandcampLimiter.wrap(
  (url: string): Promise<BandcampAlbum> =>
    new Promise((resolve, reject) =>
      bandcamp.getAlbumInfo(url, (error: string, data: BandcampAlbum) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    )
)

scrape()
