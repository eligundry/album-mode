import { useCallback } from 'react'

type Event =
  | (Record<string, unknown> & {
      event: string
    })
  | { user_id: string }

export default function useGTM() {
  const sendEvent = useCallback((event: Event) => {
    console.log('useGTM.sendEvent', event)

    if (typeof window === 'undefined' || !window.dataLayer) {
      return
    }

    window.dataLayer.push(event)
  }, [])

  return sendEvent
}
