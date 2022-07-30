import bandcamp from 'bandcamp-scraper'
import Bottleneck from 'bottleneck'

import { BandcampAlbum } from '~/lib/types/bandcamp'

const bandcampLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000 * 3,
})

const getAlbum = bandcampLimiter.wrap(
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

const api = { getAlbum }

export default api
