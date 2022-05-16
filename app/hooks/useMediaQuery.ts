import useMedia from 'react-use/lib/useMedia'
import useTailwindTheme from './useTailwindTheme'

type Theme = ReturnType<typeof useTailwindTheme>
type Query = string | ((theme: Theme) => string)

export default function useMediaQuery(query: Query, defaultState = false) {
  const theme = useTailwindTheme()

  if (typeof query !== 'string') {
    query = query(theme)
  }

  return useMedia(query, defaultState)
}
