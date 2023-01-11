import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db.server'

import { A, Container, Heading, Layout, Typography } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'

type LoaderData = {
  subreddits: Awaited<ReturnType<typeof db.getSubreddits>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    subreddits: await db.getSubreddits(),
  }

  return json(data)
}

export default function RedditIndexPage() {
  const { subreddits } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-2')}>
          Reddit
        </Heading>
        <Typography variant="hint" className={clsx('mb-2')}>
          What is the frontpage of the internet listening to?{' '}
          <A href="https://www.reddit.com/r/Music/wiki/musicsubreddits">
            Here's a huge list of music subreddits.
          </A>
        </Typography>
        <ButtonLinkGroup
          items={subreddits}
          toFunction={(subreddit) => `/reddit/${subreddit}`}
          keyFunction={(subreddit) => subreddit}
          childFunction={(subreddit) => `/r/${subreddit}`}
        />
      </Container>
    </Layout>
  )
}
