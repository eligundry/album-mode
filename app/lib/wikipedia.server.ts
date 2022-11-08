import wiki from 'wikipedia'
import * as Sentry from '@sentry/remix'

interface AlbumSearch {
  album: string
  artist: string
}

const getSummaryForAlbum = async (search: AlbumSearch) => {
  const transaction = Sentry.startTransaction({
    op: 'wikipedia',
    name: 'getSummaryForAlbum',
  })

  Sentry.addBreadcrumb({
    level: 'debug',
    type: 'wikipedia',
    category: 'wikipedia',
    message: 'getSummaryForAlbum',
    data: search,
  })

  try {
    const searchResp = await wiki.search(`${search.album} ${search.artist}`)
    const pageResp = await wiki.page(searchResp.results[0].pageid)
    const summary = await pageResp.summary()

    return {
      extract_html: summary.extract_html,
      content_urls: {
        desktop: {
          page: summary.content_urls.desktop.page,
        },
        mobile: {
          page: summary.content_urls.mobile.page,
        },
      },
    }
  } catch (e) {
    return null
  } finally {
    transaction.finish()
  }
}

export type WikipediaSummary = Awaited<ReturnType<typeof getSummaryForAlbum>>

const api = { getSummaryForAlbum }

export default api
