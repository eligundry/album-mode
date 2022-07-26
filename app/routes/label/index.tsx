import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import spotify from '~/lib/spotify'
import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Layout, Heading, Container } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import SearchBreadcrumbs from '~/components/SearchBreadcrumbs'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({
      labels: await db.getLabels(),
    })
  }

  return json({
    album: await spotify.getRandomAlbumForLabel(q),
    label: q,
  })
}

export const ErrorBoundary = AlbumErrorBoundary

export default function LabelSearch() {
  const data = useLoaderData<typeof loader>()

  if ('album' in data) {
    const { album } = data

    if (!album) {
      return null
    }

    return (
      <Layout>
        <SearchBreadcrumbs crumbs={['Labels', data.label]} />
        <Album album={album} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
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
        <a
          href="https://genius.com/Gza-labels-lyrics"
          target="_blank"
          className={clsx('block', 'w-3/4', 'mx-auto', 'mt-2')}
        >
          <img
            src="/img/rza-labels.png"
            alt={`Genius lyric cover with the GZA, RZA & Bill Murray saying "You gotta read the label / If you don't read the Label, you might get poisoned" from the GZA song "Labels"`}
          />
        </a>
      </Container>
    </Layout>
  )
}
