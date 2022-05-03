import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import promiseHash from 'promise-hash'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import { Layout, Heading, ButtonLink } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import LabelSearchForm from '~/components/Forms/LabelSearch'

type LoaderData =
  | {
      album: Awaited<ReturnType<typeof spotify.getRandomAlbumForLabel>>
    }
  | {
      labels: Awaited<ReturnType<typeof db.getLabels>>
    }

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    const data: LoaderData = await promiseHash({
      labels: db.getLabels(),
    })

    return json(data)
  }

  const data: LoaderData = await promiseHash({
    album: spotify.getRandomAlbumForLabel(q),
  })

  return json(data)
}

export default function LabelSearch() {
  const data = useLoaderData<LoaderData>()

  if ('album' in data) {
    const { album } = data

    if (!album?.external_urls?.spotify) {
      return null
    }

    return (
      <Layout>
        <Album
          url={album.external_urls.spotify}
          artist={album.artists?.[0].name}
          album={album.name}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading level="h2">Search by Label</Heading>
      <LabelSearchForm />
      {Object.entries(data.labels).map(([category, labels]) => (
        <section key={category}>
          <Heading level="h4">{category}</Heading>
          <ButtonLinkGroup
            items={labels}
            toFunction={(label) => `/label/${label.slug}`}
            keyFunction={(label) => label.slug}
            childFunction={(label) => label?.displayName ?? label.name}
          />
        </section>
      ))}
    </Layout>
  )
}
