import clsx from 'clsx'
import type { ErrorBoundaryComponent } from '@remix-run/node'
import { useLocation } from 'react-router-dom'

import { Layout, Heading, Typography, ButtonLink } from '~/components/Base'

const AlbumErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  const { pathname, search } = useLocation()

  return (
    <Layout>
      <Heading level="h2">⛔️ Whoops!</Heading>
      <Typography>
        We seemed to have run into an error. We are working on fixing it now.
        You should refresh the page to fix this issue.
      </Typography>
      <details>
        <summary>Detailed error message</summary>
        <Typography>{error.message}</Typography>
      </details>
      <ButtonLink
        color="info"
        to={pathname + search}
        className={clsx('mt-2', 'inline-block')}
      >
        🔄 &nbsp; Refresh Page
      </ButtonLink>
    </Layout>
  )
}

export default AlbumErrorBoundary
