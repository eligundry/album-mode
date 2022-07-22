import { useDarkMode } from './useMediaQuery'
import theme from '~/tailwind.config.json'

export default function useTailwindTheme() {
  return theme
}

type Pallete = NonNullable<typeof theme.daisyui.themes[0]['dark']>

export function useDaisyPallete() {
  const isDarkMode = useDarkMode()
  const theme = useTailwindTheme()
  const palletes = theme.daisyui.themes.reduce((acc, t) => {
    if (t.dark) {
      acc.dark = t.dark
    } else if (t.light) {
      acc.light = t.light
    }

    return acc
  }, {} as Record<'light' | 'dark', Pallete>)

  return isDarkMode ? palletes.dark : palletes.light
}
