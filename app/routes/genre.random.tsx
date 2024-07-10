import { LoaderFunctionArgs, redirect } from '@remix-run/node'

import { getRequestContextValues } from '~/lib/context.server'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { database } = getRequestContextValues(request, context)
  const genre = await database.getRandomGenre()
  return redirect(`/genre/${genre}?from=random`)
}
