import clsx from 'clsx'
import type { ErrorBoundaryComponent } from '@remix-run/node'

import useCurrentPath from '~/hooks/useCurrentPath'
import {
  Layout,
  Heading,
  Typography,
  ButtonLink,
  Container,
  EmojiText,
} from '~/components/Base'

const AlbumErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  const currentPath = useCurrentPath()

  return (
    <Layout>
      <Container>
        <div className={clsx('prose')}>
          <Heading level="h2">⛔️ Whoops!</Heading>
          <Typography>
            We seemed to have run into an error. We are working on fixing it
            now. You should refresh the page to fix this issue.
          </Typography>
          <details className={clsx('mb-6')}>
            <summary>Detailed error message</summary>
            <pre className={clsx('whitespace-pre-line')}>
              {error.name !== 'Error' && error.name + '\n'}
              {error.message + '\n'}
              {error.stack}
            </pre>
          </details>
          <ButtonLink to={currentPath} className={clsx('mt-2')}>
            <EmojiText emoji="🔄" label="refresh icon">
              Retry
            </EmojiText>
          </ButtonLink>
        </div>
      </Container>
    </Layout>
  )
}

export default AlbumErrorBoundary
