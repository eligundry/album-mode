import { useMediaQuery as useMedia } from '@react-hookz/web'

import twTheme from '~/tailwind.config.json'

type Query = string | ((theme: typeof twTheme) => string)

export default function useMediaQuery(query: Query, defaultState = false) {
  if (typeof query !== 'string') {
    query = query(twTheme)
  }

  return useMedia(query, { initializeWithValue: defaultState })
}

export function useIsMobile() {
  return useMediaQuery(
    (theme) => `only screen and (max-width: ${theme.screens.sm})`,
    true,
  )
}

export function useDarkMode() {
  return useMediaQuery('only screen and (prefers-color-scheme: dark)', false)
}
