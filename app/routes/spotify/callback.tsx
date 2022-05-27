import clsx from 'clsx'
import { LoaderFunction, json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import auth from '~/lib/auth'
import {
  Layout,
  Heading,
  Typography,
  ButtonLink,
  Container,
} from '~/components/Base'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const cookie = await auth.handleSpotifyLoginCallback(request)

    return redirect('/', {
      headers: {
        'Set-Cookie': await auth.cookieFactory.serialize(cookie),
      },
    })
  } catch (e) {
    let statusCode = 500

    if (e.message.startsWith('bad request:')) {
      statusCode = 400
    } else if (e.message.startsWith('unauthorized:')) {
      statusCode = 401
    }

    return json({ error: e.message }, statusCode)
  }
}

export default function SpotifyLoginCallback() {
  const { error } = useLoaderData()

  return (
    <Layout>
      <Container>
        <Heading level="h2">⛔️ Whoops!</Heading>
        <Typography>
          We seem to have run into an error. We are working on fixing it now.
        </Typography>
        <details>
          <summary>Detailed error message</summary>
          <Typography>{error}</Typography>
        </details>
        <ButtonLink
          color="info"
          to="/"
          className={clsx('mt-2', 'inline-block')}
        >
          🏚 &nbsp; Return Home
        </ButtonLink>
      </Container>
    </Layout>
  )
}
