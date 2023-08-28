import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import sample from 'lodash/sample'

import { spotifyStrategy } from '~/lib/auth.server'
import RandomRecommendation from '~/lib/random.server'
import spotifyLib from '~/lib/spotify.server'

import Album from '~/components/Album'
import Playlist from '~/components/Album/Playlist'
import { Layout } from '~/components/Base'
import config from '~/config'

const loggedOutOptions = [
  'publication',
  // 'genre',
  // 'artist',
  'featured-playlist',
] as const
const loggedInOptions = [
  ...loggedOutOptions,
  'top-artists',
  'top-artists-relations',
] as const

export async function loader({ request, context }: LoaderArgs) {
  const session = await spotifyStrategy.getSession(request)
  const options = session ? loggedInOptions : loggedOutOptions
  const variant = sample<(typeof options)[number]>(options)
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const { database } = context
  const randomRecommendation = new RandomRecommendation(spotify, database)

  return retry(async () => {
    switch (variant) {
      case 'publication': {
        const { album, review, wiki } =
          await randomRecommendation.forAnyPublication()
        return json({
          variant,
          embed: album,
          review,
          wiki,
        })
      }

      case 'featured-playlist': {
        const playlist = await randomRecommendation.forFeaturedPlaylist()
        return json({ variant, embed: playlist })
      }

      case 'top-artists':
      case 'top-artists-relations': {
        const { album, wiki } = await randomRecommendation.forUsersTopArtists(
          variant === 'top-artists-relations',
        )

        return json({ variant, embed: album, wiki })
      }

      default:
        throw new Error(`unsupported option ${variant}`)
    }
  }, config.asyncRetryConfig)
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  let embed

  switch (data.variant) {
    case 'publication':
      embed = <Album album={data.embed} wiki={data.wiki} />
      break
    case 'featured-playlist':
      embed = <Playlist playlist={data.embed} />
      break
    case 'top-artists':
      embed = <Album album={data.embed} wiki={data.wiki} />
      break
    case 'top-artists-relations':
      embed = <Album album={data.embed} wiki={data.wiki} />
      break
  }

  return <Layout>{embed}</Layout>
}
