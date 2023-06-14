import { ActionArgs, redirect } from '@remix-run/cloudflare'

import { authenticator } from '~/lib/auth.server'

export function loader() {
  return redirect('/')
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate('spotify', request)
}
