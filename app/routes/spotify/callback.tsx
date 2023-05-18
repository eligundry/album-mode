import { LoaderArgs } from '@remix-run/node'

import { authenticator } from '~/lib/auth.server'

import { PageErrorBoundary } from '~/components/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  return authenticator.authenticate('spotify', request, {
    successRedirect: '/',
    failureRedirect: '/?error=We could not log you in, please try again later',
  })
}

export const ErrorBoundary = PageErrorBoundary

export default function Callback() {
  return null
}
