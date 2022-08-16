import clsx from 'clsx'

import { Layout, Typography, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import Library from '~/components/Library'
import SyncButtonModal from '~/components/Sync/ButtonModal'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
})

export default function LibraryPage() {
  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-0')}>
          Library
        </Heading>
        <Typography variant="hint" className={clsx('mb-4')}>
          These items are saved to your browser's local storage.
        </Typography>
        <SyncButtonModal />
        <Library />
      </Container>
    </Layout>
  )
}
