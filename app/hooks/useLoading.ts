import { useState, useEffect } from 'react'
import { useTransition } from '@remix-run/react'

export default function useLoading() {
  const { state } = useTransition()
  const [showLoader, setShowLoader] = useState(false)

  // Only show the loader if a request takes more than 200ms
  useEffect(() => {
    let timeoutID: number | undefined

    if (state === 'loading' || state === 'submitting') {
      timeoutID = window.setTimeout(() => setShowLoader(true), 200)
    } else {
      setShowLoader(false)
      window.clearTimeout(timeoutID)
    }

    return () => {
      window.clearTimeout(timeoutID)
    }
  }, [state])

  return {
    loading: state === 'loading' || state === 'submitting',
    showLoader,
  }
}
