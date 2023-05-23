import { LoaderArgs, redirect } from '@remix-run/node'

export async function loader({ context: { database } }: LoaderArgs) {
  const genre = await database.getRandomGenre()
  return redirect(`/genre/${genre}?from=random`)
}
