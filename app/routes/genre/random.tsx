import { redirect } from '@remix-run/node'

import database from '~/lib/database/index.server'

export async function loader() {
  const genre = await database.getRandomGenre()
  return redirect(`/genre/${genre}?from=random`)
}
