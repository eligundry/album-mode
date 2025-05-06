import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import clsx from 'clsx'

import {
  ButtonLink,
  Container,
  EmojiText,
  Heading,
  Typography,
} from '~/components/Base'
import Document from '~/components/Base/Document'
import useCurrentPath from '~/hooks/useCurrentPath'
import useLoading from '~/hooks/useLoading'

const AlbumErrorBoundary: React.FC = () => {
  const currentPath = useCurrentPath()
  const { loading } = useLoading()
  const error = useRouteError()
  let body = <>Unknown error</>

  if (isRouteErrorResponse(error)) {
    body = (
      <>
        Code: {error.status}
        {JSON.stringify(error.data, undefined, 2)}
      </>
    )
  } else if (error instanceof Error) {
    body = (
      <>
        {`${error.message}\n`}
        {error.stack && `Stack trace:\n${error.stack}`}
      </>
    )
  }

  return (
    <Document>
      <Container>
        <div className={clsx('prose')}>
          <Heading level="h2">⛔️ Whoops!</Heading>
          <Typography>
            We seemed to have run into an error. We are working on fixing it
            now. You should refresh the page to fix this issue.
          </Typography>
          <details className={clsx('mb-6')}>
            <summary>Detailed error message</summary>
            <pre className={clsx('whitespace-pre-line')}>{body}</pre>
          </details>
          <ButtonLink
            to={currentPath}
            disabled={loading}
            className={clsx('mt-2')}
          >
            <EmojiText emoji="🔄" label="refresh icon">
              Retry
            </EmojiText>
          </ButtonLink>
        </div>
      </Container>
    </Document>
  )
}

export default AlbumErrorBoundary
