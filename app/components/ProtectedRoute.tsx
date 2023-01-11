import type { HeadersFunction } from '@remix-run/node'
import React from 'react'

export const protectedRouteHeaders: HeadersFunction = () => ({
  'WWW-Authenticate': 'Basic',
})

export const isAuthorized = (request: Request) => {
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  const header = request.headers.get('Authorization')

  if (!header) {
    return false
  }

  const base64 = header.replace('Basic ', '')
  const [username, password] = Buffer.from(base64, 'base64')
    .toString()
    .split(':')

  return username === process.env.USERNAME && password === process.env.PASSWORD
}

const ProtectedRoute: React.FC<
  React.PropsWithChildren<{ authorized: boolean }>
> = ({ children, authorized }) => {
  if (!authorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
