import clsx from 'clsx'

import { AppMetaFunction, mergeMeta } from '~/lib/remix'

import { Container, Heading, Layout, Typography } from '~/components/Base'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import SettingsForm from '~/components/Forms/Settings'
import Library from '~/components/Library'
import config from '~/config'
import useUser from '~/hooks/useUser'

export const ErrorBoundary = PageErrorBoundary
export const meta: AppMetaFunction = ({ matches }) =>
  mergeMeta(matches, [
    { title: `Library | ${config.siteTitle}` },
    {
      name: 'description',
      content: 'Albums that you like are saved here.',
    },
  ])

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
        {user && (
          <>
            <Heading level="h3" className={clsx('mb-0')}>
              Settings
            </Heading>
            <Typography variant="hint">
              These settings allow Album Mode.party to improve the quality of
              your Spotify recommendations as you use the application.
            </Typography>
            <SettingsForm className={clsx('mb-4')} />
          </>
        )}
        <Library />
      </Container>
    </Layout>
  )
}
