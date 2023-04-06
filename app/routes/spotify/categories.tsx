import { LoaderArgs, MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'

import { Container, Heading, Layout } from '~/components/Base'
import { CardLink } from '~/components/Base/Card'
import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from '~/components/ErrorBoundary'
import config from '~/config'

export async function loader({ request, context }: LoaderArgs) {
  const { serverTiming } = context
  const headers = new Headers({
    'Cache-Control': config.cacheControl.public,
  })
  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request)
  )
  const categories = await serverTiming.track('spotify.fetch', () =>
    spotify.getCategories()
  )
  headers.set(serverTiming.headerKey, serverTiming.toString())

  return json({ categories }, { headers })
}

export const ErrorBoundary = GenericErrorBoundary
export const CatchBoundary = GenericCatchBoundary
export const headers = forwardServerTimingHeaders
export const meta: MetaFunction = () => ({
  title: `Spotify Playlist Categories | ${config.siteTitle}`,
  description: `${config.siteDescription} Maybe a playlist from one of the Spotify categories will catch your fancy!`,
})

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
              titleLevel="h3"
              media={
                <img
                  src={category.icons[0].url}
                  width={category.icons[0].width}
                  height={category.icons[0].height}
                  alt={category.name}
                  className={clsx('hover:scale-105', 'ease-in duration-100')}
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
