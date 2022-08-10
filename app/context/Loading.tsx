import React, { useState, useEffect } from 'react'
import { useTransition } from '@remix-run/react'

interface LoadingContextData {
  loading: boolean
  showLoader: boolean
}

const defaultData: LoadingContextData = {
  loading: false,
  showLoader: false,
}

export const LoadingContext =
  React.createContext<LoadingContextData>(defaultData)
LoadingContext.displayName = 'LoadingContext'

const LoadingProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
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

  return (
    <LoadingContext.Provider
      value={{
        loading: state === 'loading' || state === 'submitting',
        showLoader,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export default LoadingProvider
