import clsx from 'clsx'
import { Layout, Typography, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import useSavedSearches from '~/hooks/useSavedSearches'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
})

export default function SavedSearchesPage() {
  const { searches } = useSavedSearches()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-4')}>
          Saved Searches
        </Heading>
        <Typography variant="hint" className={clsx('mb-4')}>
          These searches are saved to your browser's local storage.
        </Typography>
        <section>
          <ButtonLinkGroup
            className={clsx('breadcrumbs')}
            color="info"
            items={Object.entries(searches)}
            toFunction={([path]) => path}
            keyFunction={([path]) => path}
            childFunction={([, parts]) => (
              <ul>
                {parts.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          />
        </section>
      </Container>
    </Layout>
  )
}
