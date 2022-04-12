import type { LoaderFunction } from '@remix-run/node'
import type { Label, Publication } from '@prisma/client'
import promiseHash from 'promise-hash'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import db from '~/lib/db'

type LoaderData = {
  labels: Label[]
  publications: Publication[]
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = await promiseHash({
    labels: db.getLabels(),
    publications: db.getPublications(),
  })

  return json(data)
}

export default function Index() {
  const data = useLoaderData()

  return <pre>{JSON.stringify(data, undefined, 2)}</pre>
}
