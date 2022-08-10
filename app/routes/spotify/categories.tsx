import { json, MetaFunction, LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import spotifyLib from '~/lib/spotify.server'
import { Layout, Container, Heading } from '~/components/Base'
import { CardLink } from '~/components/Base/Card'

export const meta: MetaFunction = () => ({
  title: 'Spotify Playlist Categories | Album Mode.party 🎉',
})

export async function loader({ request }: LoaderArgs) {
  const spotify = await spotifyLib.initializeFromRequest(request)
  const cacheLifetime = 60 * 60 * 24 * 7

  return json(
    {
      categories: await spotify.getCategories(),
    },
    {
      headers: {
        'Cache-Control': `public, max-age=${cacheLifetime}, s-maxage=${cacheLifetime}`,
      },
    }
  )
}

export default function SpotifyCategories() {
  const { categories } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Playlist Categories</Heading>
        <div className={clsx('grid', 'grid-cols-2', 'sm:grid-cols-4', 'gap-4')}>
          {categories.map((category) => (
            <CardLink
              to={`/spotify/category/${category.id}`}
              key={category.id}
              mediaZoomOnHover
              media={
                <img
                  src={category.icons[0].url}
                  width={category.icons[0].width}
                  height={category.icons[0].height}
                  alt={category.name}
                  className={clsx('hover:scale-105 ease-in duration-100')}
                  loading="lazy"
                />
              }
              title={category.name}
            />
          ))}
        </div>
      </Container>
    </Layout>
  )
}
