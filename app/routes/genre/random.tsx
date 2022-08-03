import { redirect } from '@remix-run/node'

import db from '~/lib/db.server'

export async function loader() {
  const genre = await db.getRandomGenre()
  return redirect(`/genre?genre=${genre}&from=random`)
}
