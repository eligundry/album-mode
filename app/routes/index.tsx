import type { LoaderFunction } from '@remix-run/node'
import promiseHash from 'promise-hash'
import { json } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'

import db from '~/lib/db'
import { Heading, ButtonLink, Input, Layout } from '~/components/Base'

type LoaderData = {
  labels: Awaited<ReturnType<typeof db.getLabels>>
  publications: Awaited<ReturnType<typeof db.getPublications>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = await promiseHash({
    labels: db.getLabels(),
    publications: db.getPublications(),
  })

  return json(data)
}

export default function Index() {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Heading level="h2">Listen to full albums at random</Heading>
      <div className="labels">
        <Heading level="h3">Labels</Heading>
        <Form method="get" action="/label">
          <Input
            name="q"
            type="search"
            placeholder="Search for label (ex: Ovo)"
          />
        </Form>
        {data.labels.map((label) => (
          <ButtonLink to={`/label/${label.slug}`} key={label.slug}>
            {label.name}
          </ButtonLink>
        ))}
      </div>
      <div className="publications">
        <Heading level="h3">Publications</Heading>
        {data.publications.map((publication) => (
          <ButtonLink
            to={`/publication/${publication.slug}`}
            key={publication.slug}
          >
            {publication.name}
          </ButtonLink>
        ))}
      </div>
    </Layout>
  )
}
