import clsx from 'clsx'
import { LoaderFunction, ActionFunction, redirect } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { json } from '@remix-run/node'
import db from '~/lib/db'
import ProtectedRoute, {
  protectedRouteHeaders,
  isAuthorized,
} from '~/components/ProtectedRoute'
import {
  Layout,
  Container,
  Heading,
  Fieldset,
  Input,
  Button,
} from '~/components/Base'

export const headers = protectedRouteHeaders

type LoaderData =
  | {
      authorized: false
    }
  | {
      authorized: true
    }

export const loader: LoaderFunction = async ({ request }) => {
  if (!isAuthorized(request)) {
    const data: LoaderData = {
      authorized: false,
    }

    return json(data, { status: 401 })
  }

  const data = {
    authorized: true,
  }

  return json(data)
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  switch (formData.get('action')) {
    case 'new-label':
      await db.createLabelFromAdmin(formData)
      break

    default:
      console.error('invalid admin action provided', {
        action: formData.get('action'),
      })
  }

  return redirect('/admin')
}

export default function AdminIndex() {
  const { authorized } = useLoaderData<LoaderData>()

  return (
    <ProtectedRoute authorized={authorized}>
      <Layout>
        <Container>
          <Heading level="h2">Admin</Heading>
          <Form method="post">
            <Fieldset className={clsx('flex', 'flex-col')}>
              <legend>Add Label</legend>
              <input type="hidden" name="action" value="new-label" />
              <Input
                name="name"
                id="name"
                placeholder="Label name"
                required
                className={clsx('mb-2', 'w-1/2')}
              />
              <Input
                name="genre"
                id="genre"
                placeholder="Genre (ex: Hip-Hop, Indie Rock)"
                required
                className={clsx('mb-2', 'w-1/2')}
              />
              <Input
                name="slug"
                id="slug"
                placeholder="URL Slug"
                className={clsx('mb-2', 'w-1/2')}
              />
              <Button type="submit" className={clsx('w-1/4')}>
                Submit
              </Button>
            </Fieldset>
          </Form>
        </Container>
      </Layout>
    </ProtectedRoute>
  )
}
