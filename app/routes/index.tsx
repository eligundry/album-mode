import promiseHash from 'promise-hash'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import { Heading, ButtonLink, Layout, Container, Link } from '~/components/Base'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'

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
          <ButtonLinkGroup
            items={data.publications}
            toFunction={(publication) => `/publication/${publication.slug}`}
            keyFunction={(publication) => publication.slug}
            childFunction={(publication) => publication.name}
          />
        </div>
        <div className="genre">
          <Heading level="h3">
            <Link to="/genre">Genre</Link>
          </Heading>
          <GenreSearchForm defaultGenres={data.topGenres} />
        </div>
        <div className="artists-and-groups">
          <Heading level="h3">Artists & Groups</Heading>
          <ButtonLinkGroup
            items={data.artistGroupings}
            toFunction={({ slug }) => `/group/${slug}`}
            keyFunction={({ slug }) => slug}
            childFunction={({ name }) => name}
          />
        </div>
        <div className="labels">
          <Heading level="h3">
            <Link to="/label">Labels</Link>
          </Heading>
          <LabelSearchForm />
        </div>
      </Container>
    </Layout>
  )
}
