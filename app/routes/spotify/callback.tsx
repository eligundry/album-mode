import clsx from 'clsx'
import { LoaderFunction, json, createCookie, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import spotify, { spotifyAPI } from '~/lib/spotify'
import { Layout, Heading, Typography, ButtonLink } from '~/components/Base'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return json(
      { error: 'The `code` query param must be provided for login' },
      400
    )
  }

  if (!state) {
    return json(
      { error: 'The `state` query param must be provided for login' },
      400
    )
  }

  try {
    var accessTokenResp = await spotifyAPI.authorizationCodeGrant(code)
  } catch (e) {
    return json(
      {
        error: `Could not exchange authorization code for access token: ${
          e?.message ?? e
        }`,
      },
      500
    )
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await spotify.cookieFactory.serialize({
        accessToken: accessTokenResp.body.access_token,
      }),
    },
  })
}

export default function SpotifyLoginCallback() {
  const { error } = useLoaderData()

  return (
    <Layout>
      <Heading level="h2">⛔️ Whoops!</Heading>
      <Typography>
        We seemed to have run into an error. We are working on fixing it now.
        You should refresh the page to fix this issue.
      </Typography>
      <details>
        <summary>Detailed error message</summary>
        <Typography>{error}</Typography>
      </details>
      <ButtonLink color="info" to="/" className={clsx('mt-2', 'inline-block')}>
        🏚 &nbsp; Return Home
      </ButtonLink>
    </Layout>
  )
}
