import { spotifyStrategy } from '~/lib/auth.server'
import { unauthorized } from '~/lib/responses.server'

import { getEnv } from '~/env.server'

export const isAuthorized = async (request: Request) => {
  const session = await spotifyStrategy.getSession(request)

  if (!session?.user || !session.user.name) {
    throw unauthorized({ error: 'you are not logged in!' })
  }

  if (!getEnv().ADMIN_SPOTIFY_USERNAMES.includes(session.user.name)) {
    throw unauthorized({ error: 'you are not an admin!' })
  }

  return true
}
