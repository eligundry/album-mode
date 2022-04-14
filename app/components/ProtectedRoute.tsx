import React from 'react'
import type { HeadersFunction } from '@remix-run/node'

export const protectedRouteHeaders: HeadersFunction = () => ({
  'WWW-Authenticate': 'Basic',
})

export const isAuthorized = (request: Request) => {
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
