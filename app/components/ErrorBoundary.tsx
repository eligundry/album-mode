import clsx from 'clsx'
import { useCatch } from '@remix-run/react'

import {
  Layout,
  Heading,
  Typography,
  ButtonLink,
  Container,
  EmojiText,
} from '~/components/Base'

interface GenericErrorBoundaryProps {
  error: Error
  hideStack?: boolean
}

export const GenericErrorBoundary: React.FC<GenericErrorBoundaryProps> = ({
  error,
  hideStack = false,
}) => {
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
            <pre className={clsx('whitespace-pre-line')}>
              {error.name !== 'Error' && error.name + '\n'}
              {error.message + '\n'}
              {!hideStack && error.stack}
            </pre>
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

export const GenericCatchBoundary: React.FC = () => {
  const caught = useCatch()
  const error = new Error(
    `${caught.status}: ${caught.data?.error ?? caught.data.toString()}`
  )

  return <GenericErrorBoundary hideStack error={error} />
}
