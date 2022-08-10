import Bottleneck from 'bottleneck'

import { prisma } from '~/lib/db.server'
import { Spotify } from '~/lib/spotify.server'

const spotify = new Spotify()
const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 3 * 1000,
})

const updateAlbumResolvability = limiter.wrap(
  async (id: number, artist: string, album: string) => {
    let resolvable = false

    try {
      await spotify.getAlbum(album, artist)
      resolvable = true
    } catch (e) {
      console.log(`${album} by ${artist} is not resolvable`)
    }

    await prisma.albumReviewedByPublication.update({
      data: {
        resolvable,
      },
      where: {
        id,
      },
    })
  }
)

const main = async () => {
  const albums = await prisma.albumReviewedByPublication.findMany({
    where: {
      id: {
        gt: 1956,
      },
    },
  })

  await Promise.all(
    albums.map(({ id, artist, album }) =>
      updateAlbumResolvability(id, artist, album)
    )
  )
}

main()
