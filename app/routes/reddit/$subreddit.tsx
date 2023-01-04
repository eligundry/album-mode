import { LinksFunction, LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'
import youtubeStyles from 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

import reddit from '~/lib/reddit.server'

import Bandcamp from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import YouTube from '~/components/Album/YouTube'
import { A, Layout, Typography } from '~/components/Base'
import Debug from '~/components/Debug'
import Spotify from '~/components/Spotify/SimpleEmbed'

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
    throw json({ error: 'subreddit must be provided in the URL' }, 400)
  }

  const post = await reddit.getRandomPost(subreddit)

  return json({ post })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function SongFromSubreddit() {
  const { post } = useLoaderData<LoaderData>()
  let content = <Debug data={post} />
  const footer = (
    <Typography className={clsx('my-4')}>
      Need convincing?{' '}
      <A href={post.redditURL} target="_blank">
        Read what Reddit has to say about this
      </A>
      .
    </Typography>
  )

  switch (post.type) {
    case 'youtube':
      content = (
        <YouTube
          url={post.url}
          title={post.title}
          youtubeID={post.youtubeID}
          footer={footer}
        />
      )
      break
    case 'spotify':
      content = <Spotify url={post.url} title={post.title} footer={footer} />
      break
    case 'bandcamp':
      // @ts-ignore
      content = <Bandcamp album={post.bandcamp} footer={footer} />
  }

  return <Layout>{content}</Layout>
}
