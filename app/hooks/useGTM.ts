import { useCallback } from 'react'

type Event = Record<string, unknown> & {
  event: string
}

export default function useGTM() {
  const sendEvent = useCallback((event: Event) => {
    window.dataLayer.push(event)
  }, [])

  return sendEvent
}
