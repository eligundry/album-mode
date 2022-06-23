import axios from 'axios'

import { RandomRedditResponse } from './types/reddit'

const redditClient = axios.create({
  baseURL: 'https://reddit.com',
  responseType: 'json',
})

const getRandomPost = async (subreddit: string) => {
  const resp = await redditClient.get<RandomRedditResponse[]>(
    `/r/${subreddit}/random.json`
  )
  const data = resp.data[0].data.children[0].data
  const sourceURL = new URL(data.url)
  const post = {
    title: data.title,
    url: data.url,
    redditURL: `https://reddit.com${data.permalink}`,
  }

  if (sourceURL.hostname.includes('youtube')) {
    post.youtubeID = sourceURL.searchParams.get('v')
  } else if (sourceURL.hostname === 'youtu.be') {
    post.youtubeID = sourceURL.pathname.split('/').at(-1)
  }

  return post
}

const api = {
  getRandomPost,
}

export default api
