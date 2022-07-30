import wiki from 'wikipedia'

interface AlbumSearch {
  album: string
  artist: string
}

const getSummaryForAlbum = async (search: AlbumSearch) => {
  try {
    const searchResp = await wiki.search(`${search.album} ${search.artist}`)
    console.log(searchResp.results)
    const pageResp = await wiki.page(searchResp.results[0].pageid)
    const summary = await pageResp.summary()

    return summary
  } catch (e) {
    return null
  }
}

export type WikipediaSummary = Awaited<ReturnType<typeof getSummaryForAlbum>>

const api = { getSummaryForAlbum }

export default api
