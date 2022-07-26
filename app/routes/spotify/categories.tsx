import { LoaderFunction, json, MetaFunction } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import clsx from 'clsx'

import spotify from '~/lib/spotify'
import { Layout, Container, Heading } from '~/components/Base'

type LoaderData = {
  categories: Awaited<ReturnType<typeof spotify.getCategories>>
}

export const meta: MetaFunction = () => ({
  title: 'Spotify Playlist Categories | Album Mode.party 🎉',
})

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    categories: await spotify.getCategories(),
  }

  return json(data)
}

export default function SpotifyCategories() {
  const { categories } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Playlist Categories</Heading>
        <div className={clsx('flex', 'flex-row', 'flex-wrap', 'gap-4')}>
          {categories.map((category) => (
            <Link
              to={`/spotify/category/${category.id}`}
              key={category.id}
              className={clsx('mb-3', 'card', 'card-compact', 'shadow-xl')}
            >
              <img
                src={category.icons[0].url}
                width={category.icons[0].width}
                height={category.icons[0].height}
                alt={category.name}
                className={clsx('hover:scale-105 ease-in duration-100')}
                loading="lazy"
              />
              <div className={clsx('card-body')}>
                <p className={clsx('card-title')}>{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
