import { Form } from '@remix-run/react'

import { Button } from '~/components/Base'
import useLoading from '~/hooks/useLoading'

interface Props {
  className?: string
  children?: React.ReactNode
}

const SpotifyLoginButton: React.FC<Props> = ({
  className,
  children = 'Login with Spotify',
}) => {
  const { loading } = useLoading()

  return (
    <Form action="/spotify/login" method="post">
      <Button className={className} disabled={loading} type="submit">
        {children}
      </Button>
    </Form>
  )
}

export default SpotifyLoginButton
