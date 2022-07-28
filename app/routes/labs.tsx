import promiseHash from 'promise-hash'
import { MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import { Layout, Heading, Container, Link } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import HomeSection from '~/components/Base/HomeSection'

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
        <HomeSection
          title={<Link to="/label">Labels</Link>}
          subtitle="You know labels? Search and we'll see what we have. Otherwise, the link above has some ones to check out."
          className="labels"
        >
          <LabelSearchForm />
        </HomeSection>
        <HomeSection
          title="Subreddits"
          subtitle="Hear what the frontpage of the internet is listening to."
          className="subreddits"
        >
          <ButtonLinkGroup
            items={data.subreddits}
            keyFunction={(subreddit) => subreddit}
            toFunction={(subreddit) => `/reddit/${subreddit}`}
            childFunction={(subreddit) => `/r/${subreddit}`}
          />
        </HomeSection>
        <HomeSection
          title="Groups"
          subtitle="Here are some groups that we think are cool."
          className="groups"
        >
          <ButtonLinkGroup
            items={data.groups}
            keyFunction={(group) => group.slug}
            toFunction={(group) => `/group/${group.slug}`}
            childFunction={(group) => group.name}
          />
        </HomeSection>
      </Container>
    </Layout>
  )
}