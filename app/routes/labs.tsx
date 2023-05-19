import { MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'
import promiseHash from 'promise-hash'

import db from '~/lib/db.server'

import { Container, Heading, Layout, Link, Typography } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import HomeSection from '~/components/Base/HomeSection'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import config from '~/config'

export const meta: MetaFunction = () => ({
  title: `Labs 🧪 | ${config.siteTitle}`,
  descriptions:
    'Features for Album Mode.party that are not ready for prime time.',
})

export async function loader() {
  return json(
    await promiseHash({
      twitterUsers: db.getTwitterUsers(),
    })
  )
}

export const ErrorBoundary = PageErrorBoundary

export default function LibraryPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-0')}>
          Labs 🧪
        </Heading>
        <Typography variant="hint">
          These features are not ready for prime time (and may never be), but I
          think they are cool to see.
        </Typography>
        <HomeSection
          title="Twitter"
          subtitle="Here are some Twitter accounts that we think are recommending good stuff."
          className="twitter"
        >
          <ButtonLinkGroup
            items={data.twitterUsers}
            keyFunction={(username) => username}
            childFunction={(username) => `@${username}`}
            toFunction={(username) => `/twitter/${username}`}
          />
        </HomeSection>
        <HomeSection
          title={<Link to="/labels">Labels</Link>}
          subtitle="You know labels? Search and we'll see what we have. Otherwise, the link above has some ones to check out."
          className="labels"
        >
          <LabelSearchForm />
        </HomeSection>
      </Container>
    </Layout>
  )
}
