import { useLocation } from '@remix-run/react'

export default function useCurrentPath() {
  const { pathname, search } = useLocation()
  return pathname + search
}
