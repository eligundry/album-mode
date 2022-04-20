import { useMemo } from 'react'

export default function useWindow() {
  return useMemo(() => (typeof window !== 'undefined' ? window : undefined), [])
}
