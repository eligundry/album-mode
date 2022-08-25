import clsx from 'clsx'
import type { MetaFunction } from '@remix-run/node'

import Library from '~/components/Library'
import { Layout, Typography, Heading, Container } from '~/components/Base'
import config from '~/config'
import useUser from '~/hooks/useUser'

export const meta: MetaFunction = () => ({
  title: `Library | ${config.siteTitle}`,
  description: 'Albums that you like are saved here.',
})

export default function LibraryPage() {
  const user = useUser()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-0')}>
          Library
        </Heading>
        {!user ? (
          <Typography variant="hint" className={clsx('mb-4')}>
            These items are saved to your browser's local storage.
          </Typography>
        ) : (
          <Typography variant="hint" className={clsx('mb-4')}>
            These items are synced to the cloud because you are logged in with
            Spotify. Logging in on another device to this site will sync your
            library to it.
          </Typography>
        )}
        <Library />
      </Container>
    </Layout>
  )
}
