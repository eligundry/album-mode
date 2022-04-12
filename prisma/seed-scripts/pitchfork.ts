import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { PitchforkSearchResponse, ListEntity } from '~/lib/types/pitchfork'

const prisma = new PrismaClient()

const seedBestNewMusic = async () => {
  const publication = await prisma.publication.findFirst({
    where: {
      slug: 'p4k-bnm',
    },
  })

  if (!publication) {
    throw new Error('Could not find Pitchfork publication')
  }

  // Fetch all the albums
  const resp = await getSearchPage()
  const totalAlbums = resp.count
  const pages = Math.round(totalAlbums / 12)
  let rawAlbums = [...(resp.results.list ?? [])]
  const allAlbums = await Promise.all(
    [...Array(pages).keys()]
      .map((p) => p + 1)
      .flatMap((page) =>
        getSearchPage({ start: page * 12 }).then((r) => r.results.list)
      )
  )
  rawAlbums.push(...allAlbums.flat().filter((a): a is ListEntity => !!a))

  // Insert them into the DB
  await Promise.all(
    rawAlbums.map((album) =>
      prisma.albumReviewedByPublication.create({
        data: {
          publicationID: publication.id,
          album: album.promoTitle,
          slug: album.url,
          aritst: album.artists?.[0]?.display_name ?? '',
        },
      })
    )
  )
}

const getSearchPage = async ({ size = 12, start = 0 } = {}) =>
  axios
    .get<PitchforkSearchResponse>('https://pitchfork.com/api/v2/search/', {
      params: {
        types: 'reviews',
        hierarchy: 'sections/reviews/albums,channels/reviews/albums',
        isbestnewmusic: 'true',
        size,
        start,
      },
    })
    .then(({ data }) => data)

seedBestNewMusic()
