import useMedia from 'react-use/lib/useMedia'

import twTheme from '~/tailwind.config.json'

type Query = string | ((theme: typeof twTheme) => string)

export default function useMediaQuery(query: Query, defaultState = false) {
  if (typeof query !== 'string') {
    query = query(twTheme)
  }

  return useMedia(query, defaultState)
}

export function useIsMobile() {
  return useMediaQuery(
    (theme) => `only screen and (max-width: ${theme.screens.sm})`,
    true
  )
}

export function useDarkMode() {
  return useMediaQuery('only screen and (prefers-color-scheme: dark)', false)
}
