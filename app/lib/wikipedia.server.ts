import wiki from 'wikipedia'

interface AlbumSearch {
  album: string
  artist: string
}

const getSummaryForAlbum = async (search: AlbumSearch) => {
  try {
    const searchResp = await wiki.search(`${search.album} ${search.artist}`, {
      limit: 1,
      suggestion: true,
    })
    const summary = await wiki.summary(searchResp.results[0].title)

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
  }
}

export type WikipediaSummary = Awaited<ReturnType<typeof getSummaryForAlbum>>

const api = { getSummaryForAlbum }

export default api
