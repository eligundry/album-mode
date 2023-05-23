import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import clsx from 'clsx'

import {
  ButtonLink,
  Container,
  EmojiText,
  Heading,
  Layout,
  Typography,
} from '~/components/Base'

export const PageErrorBoundary: React.FC = () => {
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
        {error.message}
        {error.stack && `Stack trace:\n${error.stack}`}
      </>
    )
  }

  return (
    <Layout>
      <Container>
        <div className={clsx('prose')}>
          <Heading level="h2">⛔️ Whoops!</Heading>
          <Typography>
            We seem to have run into an error. We are working on fixing it now.
          </Typography>
          <details className={clsx('mb-6')}>
            <summary>Detailed error message</summary>
            <pre className={clsx('whitespace-pre-line')}>{body}</pre>
          </details>
          <ButtonLink to="/">
            <EmojiText emoji="🏚" label="broken home">
              Head Home
            </EmojiText>
          </ButtonLink>
        </div>
      </Container>
    </Layout>
  )
}
