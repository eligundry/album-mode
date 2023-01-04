import { LoaderFunction, json, redirect } from '@remix-run/node'

import auth from '~/lib/auth.server'

import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from '~/components/ErrorBoundary'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const cookie = await auth.handleSpotifyLoginCallback(request)

    return redirect('/', {
      headers: {
        'Set-Cookie': await auth.cookieFactory.serialize(cookie),
      },
    })
  } catch (e: any) {
    let statusCode = 500

    if (e?.message?.startsWith('bad request:')) {
      statusCode = 400
    } else if (e?.message?.startsWith('unauthorized:')) {
      statusCode = 401
    }

    throw json({ error: e.message }, statusCode)
  }
}

export const ErrorBoundary = GenericErrorBoundary
export const CatchBoundary = GenericCatchBoundary

export default function Callback() {
  return null
}
