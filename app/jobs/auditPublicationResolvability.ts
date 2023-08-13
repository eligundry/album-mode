import Bottleneck from 'bottleneck'
import { eq, gt } from 'drizzle-orm'

import {
  constructConsoleDatabase,
  reviewedItems,
} from '~/lib/database/index.server'
import { Spotify } from '~/lib/spotify.server'

import { getEnv } from '~/env.server'

const env = getEnv()
const { database } = constructConsoleDatabase()
const spotify = new Spotify({
  clientID: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
})
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

    await database
      .update(reviewedItems)
      .set({ resolvable: resolvable ? 1 : 0 })
      .where(eq(reviewedItems.id, id))
      .run()
  },
)

const main = async () => {
  const albums = await database
    .select()
    .from(reviewedItems)
    .where(gt(reviewedItems.id, 1956))
    .all()

  await Promise.all(
    albums.map(({ id, creator, name }) =>
      updateAlbumResolvability(id, creator, name),
    ),
  )
}

main()
