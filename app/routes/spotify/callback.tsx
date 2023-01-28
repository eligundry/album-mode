import { LoaderArgs } from '@remix-run/node'

import { authenticator } from '~/lib/auth.server'

import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from '~/components/ErrorBoundary'

export async function loader({ request }: LoaderArgs) {
  return authenticator.authenticate('spotify', request, {
    successRedirect: '/',
    failureRedirect: '/?error=We could not log you in, please try again later',
  })
}

export const ErrorBoundary = GenericErrorBoundary
export const CatchBoundary = GenericCatchBoundary

export default function Callback() {
  return null
}
