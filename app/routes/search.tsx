import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const queryParamSchema = z.object({
  itemID: z.string(),
  itemType: z.enum(['artist', 'genre']),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const params = zfd
    .formData(queryParamSchema)
    .parse(new URL(request.url).searchParams)

  switch (params.itemType) {
    case 'artist':
      return redirect(`/spotify/artist-id/${params.itemID}`)
    case 'genre':
      return redirect(`/genre/${params.itemID}`)
  }
}
