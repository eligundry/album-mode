import React from 'react'

const CurrentPathContext = React.createContext<string>('/')
CurrentPathContext.displayName = 'CurrentPathContext'

export default CurrentPathContext
