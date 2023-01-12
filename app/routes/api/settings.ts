import { ActionArgs, json } from '@remix-run/node'
import { ZodError } from 'zod'
import { zfd } from 'zod-form-data'

import userSettings from '~/lib/userSettings.server'

const schema = zfd.formData({
  followArtistAutomatically: zfd.checkbox({ trueValue: 'true' }),
  saveAlbumAutomatically: zfd.checkbox({ trueValue: 'true' }),
})

export async function action({ request }: ActionArgs) {
  try {
    var data = await request.formData()
  } catch (e) {
    data = new FormData()
  }

  try {
    var settings = schema.parse(data)
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw json(
        {
          error: 'request did not match the required schema',
          issues: error.format(),
        },
        400
      )
    }

    throw json({ error }, 500)
  }

  const cookie = await userSettings.set(settings)

  return json(settings, {
    headers: {
      'set-cookie': cookie,
    },
  })
}
