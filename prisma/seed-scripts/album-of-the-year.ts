import axios from 'axios'
import { JSDOM } from 'jsdom'
import trim from 'lodash/trim'

interface Options {
  listID: string
}

const axiosClient = axios.create({
  baseURL: 'https://www.albumoftheyear.org/list/',
  responseType: 'document',
  withCredentials: true,
})

const seedAlbumOfTheYear = async (options: Options) => {
  const albumArtistMap: Record<string, string> = {}

  for (let i = 1, atEnd = false; !atEnd; i++) {
    try {
      var document = await axiosClient
        .get(`${options.listID}/${i > 1 ? i : ''}`, {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
            cookie: 'PHPSESSID=18c5ae9e8d5155df13b20e850b6523c7',
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          },
        })
        .then(({ data: html }) => new JSDOM(html).window.document)
    } catch (e) {
      console.error(e.message, {
        data: e.response.data,
        request: {
          headers: e.request._headers,
        },
      })
      return
    }

    document
      .querySelectorAll('.albumListRow a[itemprop="url"]')
      .forEach((a) => {
        const [artist, album] = a.textContent
          .split('-')
          .map((text) => trim(text))

        if (artist && album) {
          albumArtistMap[album] = artist
        }
      })
  }

  console.log(albumArtistMap)
}

seedAlbumOfTheYear({
  listID: '1500-rolling-stones-500-greatest-albums-of-all-time-2020',
})
