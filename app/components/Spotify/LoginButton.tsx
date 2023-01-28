import { Form } from '@remix-run/react'

import { Button, ButtonProps } from '~/components/Base'
import useLoading from '~/hooks/useLoading'

const SpotifyLoginButton: React.FC<ButtonProps> = ({
  children = 'Login with Spotify',
  ...props
}) => {
  const { loading } = useLoading()

  return (
    <Form action="/spotify/login" method="post">
      <Button {...props} disabled={loading} type="submit">
        {children}
      </Button>
    </Form>
  )
}

export default SpotifyLoginButton
