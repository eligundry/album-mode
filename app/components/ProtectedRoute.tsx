import { HeadersFunction, json } from '@remix-run/node'
import React from 'react'

import env from '~/env.server'

export const protectedRouteHeaders: HeadersFunction = () => ({
  'WWW-Authenticate': 'Basic',
})

export const isAuthorized = (request: Request) => {
  if (env.NODE_ENV !== 'development') {
    return false
  }

  if (!env.BASIC_AUTH_USERNAME || !env.BASIC_AUTH_PASSWORD) {
    throw json({ error: 'Basic auth environment variables are not setup' }, 500)
  }

  const header = request.headers.get('Authorization')

  if (!header) {
    return false
  }

  const base64 = header.replace('Basic ', '')
  const [username, password] = Buffer.from(base64, 'base64')
    .toString()
    .split(':')

  return (
    username === env.BASIC_AUTH_USERNAME && password === env.BASIC_AUTH_PASSWORD
  )
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
