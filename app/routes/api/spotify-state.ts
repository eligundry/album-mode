import { LoaderFunction, json } from '@remix-run/node'

import auth from '~/lib/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = await auth.getCookie(request)
  let state = null

  if (cookie?.spotify && 'state' in cookie.spotify) {
    state = cookie.spotify.state
  }

  return json(
    { state },
    {
      headers: {
        'Set-Cookie': await auth.cookieFactory.serialize(cookie),
      },
    }
  )
}
