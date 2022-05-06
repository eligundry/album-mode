import promiseHash from 'promise-hash'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import { Heading, Layout, Container, Link, Typography } from '~/components/Base'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'

type LoaderData = {
  publications: Awaited<ReturnType<typeof db.getPublications>>
  artistGroupings: Awaited<ReturnType<typeof db.getArtistGroupings>>
  topGenres: Awaited<ReturnType<typeof db.getTopGenres>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = await promiseHash({
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
          <Heading level="h3" className={clsx('mb-2')}>
            Publications
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Play a random album recommended by the pros.
          </Typography>
          <ButtonLinkGroup
            items={data.publications}
            toFunction={(publication) => `/publication/${publication.slug}`}
            keyFunction={(publication) => publication.slug}
            childFunction={(publication) => publication.name}
          />
        </div>
        <div className="artist">
          <Heading level="h3" className={clsx('mb-2')}>
            Artist
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Want an album from an artist similar to one you like? What's their
            name?
          </Typography>
          <RelatedArtistSearchForm />
        </div>
        <div className="genre">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/genre">Genre</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Have a genre in mind? Search for it and we'll find you something.
          </Typography>
          <GenreSearchForm defaultGenres={data.topGenres} />
        </div>
        <div className="labels">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/label">Labels</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            You know labels? Search and we'll see what we have. Otherwise, the
            link above has some ones to check out.
          </Typography>
          <LabelSearchForm />
        </div>
        <div className="artists-and-groups">
          <Heading level="h3" className={clsx('mb-2')}>
            Curated Artists & Groups
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Here are some artists and groups that I dig, maybe you'll like them?
          </Typography>
          <ButtonLinkGroup
            items={data.artistGroupings}
            toFunction={({ slug }) => `/group/${slug}`}
            keyFunction={({ slug }) => slug}
            childFunction={({ name }) => name}
          />
        </div>
      </Container>
    </Layout>
  )
}
