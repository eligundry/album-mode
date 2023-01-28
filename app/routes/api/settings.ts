import { ActionArgs, json } from '@remix-run/node'
import { serverError } from 'remix-utils'
import { ZodError } from 'zod'
import { zfd } from 'zod-form-data'

import { badRequest } from '~/lib/responses.server'
import userSettings from '~/lib/userSettings.server'

const schema = zfd.formData({
  followArtistAutomatically: zfd.checkbox({ trueValue: 'true' }),
  saveAlbumAutomatically: zfd.checkbox({ trueValue: 'true' }),
})

export async function action({ request, context: { logger } }: ActionArgs) {
  try {
    var data = await request.formData()
  } catch (e) {
    data = new FormData()
  }

  try {
    var settings = schema.parse(data)
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw badRequest({
        error: 'request did not match the required schema',
        issues: error.issues,
        logger,
      })
    }

    throw serverError({ error, logger })
  }

  const cookie = await userSettings.set({ request, ...settings })

  return json(settings, {
    headers: {
      'set-cookie': cookie,
    },
  })
}
