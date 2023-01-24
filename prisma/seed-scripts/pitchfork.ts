import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { stripHtml } from 'string-strip-html'
import yargs from 'yargs'

import { urlWithUTMParams } from '~/lib/queryParams'
import { ListEntity, PitchforkSearchResponse } from '~/lib/types/pitchfork'

const prisma = new PrismaClient()
const searchLimiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 1000,
})

type PitchforkSlug = 'bnm' | 'bnr' | '8-plus' | '7-plus' | 'sunday-reviews'

const scrapeP4k = async (slug: PitchforkSlug) => {
  const publication = await prisma.publication.findFirst({
    where: {
      slug: `p4k-${slug}`,
    },
  })

  if (!publication) {
    throw new Error(`Could not find Pitchfork publication for 'p4k-${slug}'`)
  }

  // Since we have bootstrapped all the older albums, limit the update jobs to
  // the first 3 pages
  const resp = await getSearchPage(slug, 12, 0)
  const totalAlbums = resp.count
  const pages = Math.min(Math.round(totalAlbums / 12), 4)
  // const pages = Math.round(totalAlbums / 12)
  console.log(`we will be fetching ${pages} pages`)
  let rawAlbums = [...(resp.results.list ?? [])]
  const allAlbums = await Promise.all(
    [...Array(pages).keys()]
      .map((p) => p + 1)
      .flatMap((page) =>
        getSearchPage(slug, 12, page * 12).then((r) => r.results.list)
      )
  )
  rawAlbums.push(...allAlbums.flat().filter((a): a is ListEntity => !!a))

  // Insert them into the DB
  let inserted = 0
  await Promise.all(
    rawAlbums.map((album) =>
      prisma.albumReviewedByPublication
        .create({
          data: {
            publicationID: publication.id,
            album: stripHtml(album.seoTitle || album.title).result,
            slug: urlWithUTMParams(`https://pitchfork.com${album.url}`, {
              term: `p4k-${slug}`,
            }).toString(),
            artist: album.artists?.[0]?.display_name || '',
          },
        })
        .then(() => inserted++)
        .catch(() => {})
    )
  )

  console.log(`Inserted ${inserted} albums`)
}

const getSearchPage = searchLimiter.wrap(
  async (slug: PitchforkSlug, size: number, start: number) => {
    console.log(`fetching page ${start / size}`)
    const params: Record<string, string | number> = {
      types: 'reviews',
      hierarchy: 'sections/reviews/albums,channels/reviews/albums',
      size,
      start,
    }

    switch (slug) {
      case 'bnm':
        params.isbestnewmusic = 'true'
        break
      case 'bnr':
        params.isbestnewreissue = 'true'
        params.sort = 'publishdate desc,position asc'
        break
      case '8-plus':
        params.rating_from = '8.0'
        params.sort = 'publishdate desc,position asc'
        break
      case '7-plus':
        params.rating_from = '7.0'
        params.sort = 'publishdate desc,position asc'
        break
      case 'sunday-reviews':
        params.tags = 'sunday review'
        params.sort = 'publishdate desc'
        break
    }

    try {
      const resp = await axios.get<PitchforkSearchResponse>(
        'https://pitchfork.com/api/v2/search/',
        { params }
      )

      return resp.data
    } catch (e: any) {
      if (e.response) {
        throw new Error(
          `Request for page starting with offset ${start} failed with ${e.response.statusCode}: ${e.response.data}`
        )
      }

      throw e
    }
  }
)

const main = async () => {
  const args = await yargs
    .scriptName('pitchfork-scraper')
    .usage('$0 --slug <slug>')
    .option('slug', {
      describe: 'The reviews slug to update',
      type: 'string',
      choices: ['bnm', 'bnr', '8-plus', '7-plus', 'sunday-reviews'],
      demandOption: true,
    })
    .help().argv

  await scrapeP4k(args.slug as PitchforkSlug)
}

main()
