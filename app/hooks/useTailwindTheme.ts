import theme from '~/tailwind.config.json'

import { useDarkMode } from './useMediaQuery'

export default function useTailwindTheme() {
  const isDarkMode = useDarkMode()
  const pallete = useDaisyPallete()

  return {
    isDarkMode,
    isLightMode: !isDarkMode,
    pallete,
    colors: theme.colors,
    theme,
  }
}

type Pallete = NonNullable<(typeof theme.daisyui.themes)[0]['dark']>

export function useDaisyPallete() {
  const isDarkMode = useDarkMode()
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
