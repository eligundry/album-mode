import { useEffect, useState } from 'react'
import clsx from 'clsx'
import useLocation from 'react-use/lib/useLocation'

import { ButtonLink } from '~/components/Base'

const SpotifyLoginButton: React.FC = () => {
  const { origin } = useLocation()
  const [loginURL, setLoginURL] = useState<URL>()

  useEffect(() => {
    // @TODO save the state to a cookie and check it in the redirect
    const state = Math.random().toString(36).slice(2, 18)
    const loginURL = new URL('https://accounts.spotify.com/authorize')
    loginURL.searchParams.set('response_type', 'code')
    loginURL.searchParams.set('client_id', window.ENV.SPOTIFY_CLIENT_ID)
    loginURL.searchParams.set('scope', 'user-library-read')
    loginURL.searchParams.set('redirect_uri', `${origin}/spotify/callback`)
    loginURL.searchParams.set('state', state)

    setLoginURL(loginURL)
  }, [origin])

  return (
    <ButtonLink
      href={loginURL?.toString() ?? '#'}
      color="info"
      className={clsx('inline-block')}
    >
      Login with Spotify
    </ButtonLink>
  )
}

export default SpotifyLoginButton
