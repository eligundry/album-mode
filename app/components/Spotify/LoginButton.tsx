import { useState } from 'react'
import useAsync from 'react-use/lib/useAsync'
import useLocation from 'react-use/lib/useLocation'

import { ButtonLink } from '~/components/Base'
import useLoading from '~/hooks/useLoading'

interface Props {
  className?: string
  children?: React.ReactNode
}

const SpotifyLoginButton: React.FC<Props> = ({
  className,
  children = 'Login with Spotify',
}) => {
  const { origin } = useLocation()
  const [loginURL, setLoginURL] = useState<URL>()
  const { loading } = useLoading()

  useAsync(async () => {
    const stateResp = await fetch('/api/spotify-state', {
      credentials: 'include',
    })
    const { state } = await stateResp.json()

    const loginURL = new URL('https://accounts.spotify.com/authorize')
    loginURL.searchParams.set('response_type', 'code')
    loginURL.searchParams.set('client_id', window.ENV.SPOTIFY_CLIENT_ID)
    loginURL.searchParams.set(
      'scope',
      'user-library-read user-read-playback-state'
    )
    loginURL.searchParams.set('redirect_uri', `${origin}/spotify/callback`)
    loginURL.searchParams.set('state', state)

    setLoginURL(loginURL)
  }, [origin])

  return (
    <ButtonLink
      href={loginURL?.toString() ?? '#'}
      className={className}
      disabled={loading || !loginURL}
    >
      {children}
    </ButtonLink>
  )
}

export default SpotifyLoginButton
