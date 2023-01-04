import { useCatch } from '@remix-run/react'
import clsx from 'clsx'

import {
  ButtonLink,
  Container,
  EmojiText,
  Heading,
  Layout,
  Typography,
} from '~/components/Base'
import useCurrentPath from '~/hooks/useCurrentPath'
import useLoading from '~/hooks/useLoading'

interface AlbumErrorBoundaryProps {
  error: Error
  hideStack?: boolean
}

const AlbumErrorBoundary: React.FC<AlbumErrorBoundaryProps> = ({
  error,
  hideStack = false,
}) => {
  const currentPath = useCurrentPath()
  const { loading } = useLoading()

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
              {!hideStack && error.stack}
            </pre>
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
    </Layout>
  )
}

export const AlbumCatchBoundary = () => {
  const caught = useCatch()
  const error = new Error(
    `${caught.status}: ${caught.data?.error ?? caught.data.toString()}`
  )

  return <AlbumErrorBoundary error={error} hideStack />
}

export default AlbumErrorBoundary
