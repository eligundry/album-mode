import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import admin from '~/lib/admin.server'

import { Container, Heading, Layout } from '~/components/Base'
import AddArtistGroupingForm from '~/components/Forms/AddArtistGrouping'
import AddLabelForm from '~/components/Forms/AddLabel'
import ProtectedRoute, {
  isAuthorized,
  protectedRouteHeaders,
} from '~/components/ProtectedRoute'

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
  await admin.handleAdminFormSubmission(formData)
  return redirect('/admin')
}

export default function AdminIndex() {
  const { authorized } = useLoaderData<LoaderData>()

  return (
    <ProtectedRoute authorized={authorized}>
      <Layout>
        <Container>
          <Heading level="h2">Admin</Heading>
          <AddLabelForm />
          <AddArtistGroupingForm />
        </Container>
      </Layout>
    </ProtectedRoute>
  )
}
