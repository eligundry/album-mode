import useMediaQuery from './useMediaQuery'

export default function useIsMobile() {
  return useMediaQuery(
    (theme) => `only screen and (max-width: ${theme.screens.sm})`,
    true
  )
}
