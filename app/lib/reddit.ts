import axios from 'axios'
import bandcamp from 'bandcamp-scraper'
import sample from 'lodash/sample'
import * as Sentry from '@sentry/remix'

import { RandomRedditResponse } from './types/reddit'
import { BandcampAlbum } from './types/bandcamp'

const redditClient = axios.create({
  baseURL: 'https://reddit.com',
  responseType: 'json',
})

redditClient.interceptors.response.use(
  (response) => response,
  (error) => {
    Sentry.captureException(error, {
      tags: {
        reddit: true,
      },
    })

    return Promise.reject(error)
  }
)

interface BasePostData {
  title: string
  url: string
  redditURL: string
}

interface YouTube {
  type: 'youtube'
  youtubeID: string
}

interface Spotify {
  type: 'spotify'
}

interface Bandcamp {
  type: 'bandcamp'
  bandcamp: {
    albumID: string | number
    artist: string
    album: string
    url: string
  }
}

export type RedditPost = BasePostData &
  (YouTube | Spotify | Bandcamp | { type: 'unknown' })

const getRandomPost = async (subreddit: string): Promise<RedditPost> => {
  const resp = await redditClient.get<
    RandomRedditResponse[] | RandomRedditResponse
  >(`/r/${subreddit}/random.json`)
  console.log(resp.data)
  const data = Array.isArray(resp.data)
    ? resp.data[0].data.children[0].data
    : sample(resp.data.data.children)?.data ?? resp.data.data.children[0].data
  const sourceURL = new URL(data.url)
  const post: RedditPost = {
    type: 'unknown',
    title: data.title,
    url: data.url,
    redditURL: `https://reddit.com${data.permalink}`,
  }

  if (sourceURL.hostname.includes('youtube')) {
    return {
      ...post,
      type: 'youtube',
      youtubeID: sourceURL.searchParams.get('v') as string,
    }
  } else if (sourceURL.hostname === 'youtu.be') {
    return {
      ...post,
      type: 'youtube',
      youtubeID: sourceURL.pathname.split('/').at(-1) as string,
    }
  } else if (sourceURL.hostname.includes('bandcamp.com')) {
    const album = await getBandcampEmbedData(data.url)

    return {
      ...post,
      type: 'bandcamp',
      bandcamp: {
        albumID: album.raw.id,
        artist: album.artist,
        album: album.title,
        url: album.url,
      },
    }
  } else if (sourceURL.hostname.includes('spotify.com')) {
    return {
      ...post,
      type: 'spotify',
    }
  }

  return post
}

const getBandcampEmbedData = async (url: string): Promise<BandcampAlbum> =>
  new Promise((resolve, reject) =>
    bandcamp.getAlbumInfo(url, (error: string, data: BandcampAlbum) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  )

const api = {
  getRandomPost,
}

export default api
