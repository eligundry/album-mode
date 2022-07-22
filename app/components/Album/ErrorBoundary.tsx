import clsx from 'clsx'
import type { ErrorBoundaryComponent } from '@remix-run/node'
import { useLocation } from 'react-router-dom'

import {
  Layout,
  Heading,
  Typography,
  ButtonLink,
  Container,
} from '~/components/Base'

const AlbumErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  const { pathname, search } = useLocation()

  return (
    <Layout>
      <Container>
        <div className={clsx('prose')}>
          <Heading level="h2">⛔️ Whoops!</Heading>
          <Typography>
            We seemed to have run into an error. We are working on fixing it
            now. You should refresh the page to fix this issue.
          </Typography>
          <pre>{error.message}</pre>
          <ButtonLink
            color="info"
            to={pathname + search}
            className={clsx('mt-2')}
          >
            🔄 &nbsp; Retry
          </ButtonLink>
        </div>
      </Container>
    </Layout>
  )
}

export default AlbumErrorBoundary
