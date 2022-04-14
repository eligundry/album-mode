import clsx from 'clsx'
import type { LoaderFunction } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { json } from '@remix-run/node'
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

export default function AdminIndex() {
  const { authorized } = useLoaderData<LoaderData>()

  return (
    <ProtectedRoute authorized={authorized}>
      <Layout>
        <Container>
          <Heading level="h2">Admin</Heading>
          <Form>
            <Fieldset className={clsx('flex', 'flex-col')}>
              <legend>Add Label</legend>
              <Input
                name="name"
                id="name"
                placeholder="Label name"
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
