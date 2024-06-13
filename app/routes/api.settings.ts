import { ActionFunctionArgs, json } from '@remix-run/node'
import { ZodError } from 'zod'
import { zfd } from 'zod-form-data'

import { getRequestContextValues } from '~/lib/context.server'
import { badRequest, serverError } from '~/lib/responses.server'
import userSettings from '~/lib/userSettings.server'

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = getRequestContextValues(request, context)

  try {
    var data = await request.formData()
  } catch (e) {
    data = new FormData()
  }

  try {
    var settings = zfd.formData(userSettings.schema).parse(data)
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
