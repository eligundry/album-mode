import { LoaderFunction, LinksFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Layout } from '~/components/Base'
import Debug from '~/components/Debug'
import YouTube from '~/components/Album/YouTube'
import reddit from '~/lib/reddit'

import youtubeStyles from 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

type LoaderData = {
  post: Awaited<ReturnType<typeof reddit.getRandomPost>>
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: youtubeStyles,
  },
]

export const loader: LoaderFunction = async ({ params }) => {
  const subreddit = params.subreddit

  if (!subreddit) {
    throw new Error('subreddit must be provided in the URL')
  }

  const post = await reddit.getRandomPost(subreddit)

  return json({
    post,
  })
}

export default function SongFromSubreddit() {
  const { post } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <YouTube
        url={post.url}
        title={post.title}
        redditURL={post.redditURL}
        youtubeID={post.youtubeID}
      />
      {/* <Debug data={post} /> */}
    </Layout>
  )
}
