import type { MetaFunction } from '@remix-run/node'
import clsx from 'clsx'

import { Container, Heading, Layout, Typography } from '~/components/Base'
import SavedSearches from '~/components/SavedSearches'
import config from '~/config'

export const meta: MetaFunction = () => ({
  title: `Library | ${config.siteTitle}`,
  description: 'The searches you have saved to revisit later.',
})

export default function SavedSearchesPage() {
  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-4')}>
          Saved Searches
        </Heading>
        <Typography variant="hint" className={clsx('mb-4')}>
          These searches are saved to your browser's local storage.
        </Typography>
        <SavedSearches />
      </Container>
    </Layout>
  )
}
