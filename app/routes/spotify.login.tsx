// app/routes/auth/spotify.tsx
import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { authenticator } from '~/lib/auth.server'

export function loader() {
  return redirect('/')
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate('spotify', request)
}
