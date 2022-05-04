import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import yargs from 'yargs'
import { PitchforkSearchResponse, ListEntity } from '~/lib/types/pitchfork'

const prisma = new PrismaClient()

type PitchforkSlug = 'bnm' | 'bnr' | '8-plus' | 'sunday-reviews'

const scrapeP4k = async (slug: PitchforkSlug) => {
  const publication = await prisma.publication.findFirst({
    where: {
      slug: `p4k-${slug}`,
    },
  })

  if (!publication) {
    throw new Error(`Could not find Pitchfork publication for 'p4k-${slug}'`)
  }

  const searchParams = new URLSearchParams()
  searchParams.set('utm_campaign', 'album-mode.party')
  searchParams.set('utm_term', `p4k-${slug}`)

  // Fetch all the albums
  const resp = await getSearchPage(slug)
  const totalAlbums = resp.count
  const pages = Math.round(totalAlbums / 12)
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
  await Promise.all(
    rawAlbums.map((album) =>
      prisma.albumReviewedByPublication
        .create({
          data: {
            publicationID: publication.id,
            album: album.promoTitle,
            slug: `${album.url}?${searchParams.toString()}`,
            aritst: album.artists?.[0]?.display_name || '',
          },
        })
        .catch(() => {})
    )
  )
}

const getSearchPage = async (slug: PitchforkSlug, size = 12, start = 1) => {
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
    case 'sunday-reviews':
      params.tags = 'sunday review'
      params.sort = 'publishdate desc'
      break
  }

  const resp = await axios.get<PitchforkSearchResponse>(
    'https://pitchfork.com/api/v2/search/',
    { params }
  )

  return resp.data
}

const main = async () => {
  const args = await yargs
    .scriptName('pitchfork-scraper')
    .usage('$0 --slug <slug>')
    .option('slug', {
      describe: 'The reviews slug to update',
      type: 'string',
      choices: ['bnm', 'bnr', '8-plus', 'sunday-reviews'],
      demandOption: true,
    })
    .help().argv

  await scrapeP4k(args.slug)
}

main()
