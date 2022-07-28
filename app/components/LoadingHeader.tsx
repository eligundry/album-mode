import clsx from 'clsx'
import { useTransition } from '@remix-run/react'
import { useEffect, useState } from 'react'

const LoadingHeader: React.FC = () => {
  const { state } = useTransition()
  const [showLoader, setShowLoader] = useState(false)

  // Only show the loader if a request takes more than 200ms
  useEffect(() => {
    let timeoutID: number | undefined

    if (state === 'loading' || state === 'submitting') {
      timeoutID = window.setTimeout(() => setShowLoader(true), 200)
    } else {
      setShowLoader(false)
    }

    return () => {
      window.clearTimeout(timeoutID)
    }
  }, [state])

  return (
    <progress
      value={showLoader ? undefined : 0}
      max={showLoader ? undefined : 100}
      className={clsx(
        'progress',
        'progress-primary',
        'align-top',
        'rounded-none',
        'bg-transparent',
        '[&::-webkit-progress-bar]:bg-transparent',
        showLoader && ['sticky', 'top-0']
      )}
    />
  )
}

export default LoadingHeader
