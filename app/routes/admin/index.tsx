import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { json } from '@remix-run/node'

import admin from '~/lib/admin.server'

import { Container, Heading, Layout } from '~/components/Base'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import AddArtistGroupingForm from '~/components/Forms/AddArtistGrouping'
import AddLabelForm from '~/components/Forms/AddLabel'
import { isAuthorized } from '~/components/ProtectedRoute'

export const loader: LoaderFunction = async ({ request }) => {
  await isAuthorized(request)

  return json({
    authorized: true,
  })
}

export const action: ActionFunction = async ({ request }) => {
  await isAuthorized(request)
  const formData = await request.formData()
  await admin.handleAdminFormSubmission(formData)
  return redirect('/admin')
}

export const ErrorBoundary = PageErrorBoundary

export default function AdminIndex() {
  return (
    <Layout>
      <Container>
        <Heading level="h2">Admin</Heading>
        <AddLabelForm />
        <AddArtistGroupingForm />
      </Container>
    </Layout>
  )
}
