import clsx from 'clsx'
import promiseHash from 'promise-hash'
import { MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import { Layout, Typography, Heading, Container, Link } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'

export const meta: MetaFunction = () => ({
  title: 'Labs 🧪 | Album Mode.party 🎉',
  descriptions:
    'Features for Album Mode.party that are not ready for prime time.',
})

export async function loader() {
  return json(
    await promiseHash({
      groups: db.getArtistGroupings(),
      subreddits: db.getSubreddits(),
    })
  )
}

export default function LibraryPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Labs 🧪</Heading>
        <div className="labels">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/label">Labels</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            You know labels? Search and we'll see what we have. Otherwise, the
            link above has some ones to check out.
          </Typography>
          <LabelSearchForm />
        </div>
        <div className="labels">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/label">Subreddits</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Hear what the frontpage of the internet is listening to.
          </Typography>
          <ButtonLinkGroup
            items={data.subreddits}
            keyFunction={(subreddit) => subreddit}
            toFunction={(subreddit) => `/reddit/${subreddit}`}
            childFunction={(subreddit) => `/r/${subreddit}`}
          />
        </div>
        <div className="groups">
          <Heading level="h3" className={clsx('mb-2')}>
            Groups
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Here are some groups that we think are cool.
          </Typography>
          <ButtonLinkGroup
            items={data.groups}
            keyFunction={(group) => group.slug}
            toFunction={(group) => `/group/${group.slug}`}
            childFunction={(group) => group.name}
          />
        </div>
      </Container>
    </Layout>
  )
}
