import promiseHash from 'promise-hash'
import { json, LoaderFunction } from '@remix-run/node'
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
import GenreSearchInput from '~/components/Genre/SearchInput'

type LoaderData = {
  labels: Awaited<ReturnType<typeof db.getLabels>>
  publications: Awaited<ReturnType<typeof db.getPublications>>
  artistGroupings: Awaited<ReturnType<typeof db.getArtistGroupings>>
  topGenres: Awaited<ReturnType<typeof db.getTopGenres>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = await promiseHash({
    labels: db.getLabels(),
    publications: db.getPublications(),
    artistGroupings: db.getArtistGroupings(),
    topGenres: db.getTopGenres(),
  })

  return json(data)
}

export default function Index() {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('text-center')}>
          Don't know what to listen to?
          <br /> Let us recommend an album.
        </Heading>
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
        <div className="genre">
          <Heading level="h3">Genre</Heading>
          <Form method="get" action="/genre">
            <GenreSearchInput defaultGenres={data.topGenres} />
          </Form>
        </div>
        <div className="artists-and-groups">
          <Heading level="h3">Artists & Groups</Heading>
          {data.artistGroupings.map((artist) => (
            <ButtonLink
              key={artist.slug}
              to={`/group/${artist.slug}`}
              className={clsx('mr-2', 'mb-2', 'inline-block')}
            >
              {artist.name}
            </ButtonLink>
          ))}
        </div>
        <div className="labels">
          <Heading level="h3">Labels</Heading>
          <Form method="get" action="/label">
            <Input
              name="q"
              type="search"
              placeholder="Search for label (ex: OVO)"
              className={clsx('mb-4')}
            />
          </Form>
          {Object.entries(data.labels).map(([category, labels]) => (
            <section key={category}>
              <Heading level="h4">{category}</Heading>
              {labels.map((label) => (
                <ButtonLink
                  to={`/label/${label.slug}`}
                  key={label.slug}
                  className={clsx('mr-2', 'mb-2', 'inline-block')}
                >
                  {label?.displayName ?? label.name}
                </ButtonLink>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
