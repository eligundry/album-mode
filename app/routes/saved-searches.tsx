import clsx from 'clsx'
import { Layout, Typography, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import SavedSearches from '~/components/SavedSearches'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
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
