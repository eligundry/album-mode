import { useLocation } from '@remix-run/react'
import clsx from 'clsx'
import { Portal } from 'react-portal'

import { ButtonLink } from '~/components/Base'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'

const AutoAlert: React.FC = () => {
  const { search, pathname } = useLocation()
  const params = new URLSearchParams(search.substring(1))
  const error = params.get('error')
  const showLoginButton = params.get('showLoginButton')

  if (!error) {
    return null
  }

  return (
    <Portal>
      <div
        className={clsx(
          'alert',
          'alert-error',
          'shadow-lg',
          'fixed',
          'bottom-2',
          'items-start',
          'content-center',
          ['left-[4.15%]', 'sm:left-2'],
          ['w-11/12', 'sm:w-1/2']
        )}
      >
        <div className={clsx('sm:place-self-center')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={clsx('stroke-current', 'flex-shrink-0', 'h-6', 'w-6')}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
        <div className={clsx('flex-none', 'self-end')}>
          {showLoginButton && <SpotifyLoginButton size="sm" />}
          <ButtonLink
            to={pathname}
            className={clsx('btn', 'flex-shrink-0')}
            replace
            color="reset"
            size="sm"
          >
            Close
          </ButtonLink>
        </div>
      </div>
    </Portal>
  )
}

export default AutoAlert
