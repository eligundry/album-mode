import promiseHash from 'promise-hash'
import { json, LoaderFunction, HeadersFunction } from '@remix-run/node'
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

// Cache the homepage for a day in the CDN. We want updates to populate but not
// run up the bill serving it.
export const headers = () => {
  if (process.env.NODE_ENV !== 'production') {
    return {}
  }

  return {
    'Cache-Control': 'public, max-age=30, s-maxage=86400',
  }
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
