import { json, MetaFunction, LoaderArgs } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import clsx from 'clsx'

import spotifyLib from '~/lib/spotify'
import { Layout, Container, Heading } from '~/components/Base'

export const meta: MetaFunction = () => ({
  title: 'Spotify Playlist Categories | Album Mode.party 🎉',
})

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)

  return json({
    categories: await spotify.getCategories(),
  })
}

export default function SpotifyCategories() {
  const { categories } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Playlist Categories</Heading>
        <div className={clsx('flex', 'flex-wrap', 'flex-row', 'gap-4')}>
          {categories.map((category) => (
            <Link
              to={`/spotify/category/${category.id}`}
              key={category.id}
              className={clsx(
                'mb-3',
                'card',
                'card-compact',
                'shadow-xl',
                'w-44'
              )}
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
