import type { LoaderFunction } from '@remix-run/node'
import promiseHash from 'promise-hash'
import { json } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import {
  Heading,
  ButtonLink,
  Input,
  Layout,
  Container,
} from '~/components/Base'

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
      <Container>
        <Heading level="h2">
          Don't know what to listen to?
          <br /> Let us recommend something.
        </Heading>
        <div className="labels">
          <Heading level="h3">Labels</Heading>
          <Form method="get" action="/label">
            <Input
              name="q"
              type="search"
              placeholder="Search for label (ex: Ovo)"
              className={clsx('mb-4')}
            />
          </Form>
          {data.labels.map((label) => (
            <ButtonLink
              to={`/label/${label.slug}`}
              key={label.slug}
              className={clsx('mr-2', 'mb-2', 'inline-block')}
            >
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
              className={clsx('mr-2', 'mb-2', 'inline-block')}
            >
              {publication.name}
            </ButtonLink>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
