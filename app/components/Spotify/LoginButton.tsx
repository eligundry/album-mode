import { useEffect, useState } from 'react'
import useLocation from 'react-use/lib/useLocation'

import { ButtonLink } from '~/components/Base'
import useLoading from '~/hooks/useLoading'

interface Props {
  className?: string
  state: string
}

const SpotifyLoginButton: React.FC<Props> = ({ className, state }) => {
  const { origin } = useLocation()
  const [loginURL, setLoginURL] = useState<URL>()
  const { loading } = useLoading()

  useEffect(() => {
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
      disabled={loading}
    >
      Login with Spotify
    </ButtonLink>
  )
}

export default SpotifyLoginButton
