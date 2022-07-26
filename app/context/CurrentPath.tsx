import React, { useMemo } from 'react'
import useLocation from 'react-use/lib/useLocation'

export const CurrentPathContext = React.createContext<string>('/')
CurrentPathContext.displayName = 'CurrentPathContext'

const CurrentPathProvider: React.FC<{ initialPath: string }> = ({
  initialPath,
  children,
}) => {
  const { pathname, search } = useLocation()
  console.log({ pathname, search })
  const currentPath = useMemo(() => {
    if (pathname) {
      return pathname + (search ?? '')
    }

    return initialPath
  }, [initialPath, pathname, search])

  return (
    <CurrentPathContext.Provider value={currentPath}>
      {children}
    </CurrentPathContext.Provider>
  )
}

export default CurrentPathProvider
