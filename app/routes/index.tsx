import type { LoaderFunction } from '@remix-run/node'
import promiseHash from 'promise-hash'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'
import { Heading, ButtonLink, Typography } from '~/components/Base'

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
    <>
      <Heading level="h1">Album Mode</Heading>
      <Typography>Listen to full albums at random</Typography>
      <div className="labels">
        <Heading level="h2">Labels</Heading>
        {data.labels.map((label) => (
          <ButtonLink to={`/label/${label.slug}`} key={label.slug}>
            {label.name}
          </ButtonLink>
        ))}
      </div>
      <div className="publications">
        <Heading level="h2">Publications</Heading>
        {data.publications.map((publication) => (
          <ButtonLink
            to={`/publication/${publication.slug}`}
            key={publication.slug}
          >
            {publication.name}
          </ButtonLink>
        ))}
      </div>
    </>
  )
}
