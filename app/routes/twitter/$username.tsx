import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db'
import spotifyLib from '~/lib/spotify'
import { Layout, A } from '~/components/Base'
import Album from '~/components/Album'
import Playlist from '~/components/Album/Playlist'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import Debug from '~/components/Debug'
import TweetEmbed from '~/components/TweetEmbed'

export async function loader({ params, request }: LoaderArgs) {
  const username = params.username

  if (!username) {
    throw new Error('username param must be present')
  }

  const tweet = await db.getRandomTweet(username)

  switch (tweet.service) {
    case 'bandcamp': {
      return json({
        tweet,
        service: 'bandcamp',
        type: 'album',
      })
    }
    case 'spotify': {
      const spotify = await spotifyLib
        .initializeFromRequest(request)
        .then((s) => s.getClient())
      let embed:
        | SpotifyApi.PlaylistObjectSimplified
        | SpotifyApi.AlbumObjectSimplified
        | undefined

      switch (tweet.itemType) {
        case 'playlist': {
          embed = await spotify
            .getPlaylist(tweet.albumID)
            .then((resp) => resp.body)
          break
        }
        case 'album':
        case 'track': {
          embed = await spotify
            .getAlbum(tweet.albumID)
            .then((resp) => resp.body)
          break
        }
        default:
          throw new Error(`unsupported spotify embed type ${tweet.itemType}`)
      }

      return json({
        tweet,
        service: 'spotify',
        embed,
      })
    }
    default:
      throw new Error(`unsupported service ${tweet.service}`)
  }
}

export const ErrorBoundary = AlbumErrorBoundary

export default function AlbumFromTwitter() {
  const data = useLoaderData<typeof loader>()
  const tweet = <TweetEmbed tweet={data.tweet} />
  let album = null

  switch (data.service) {
    case 'bandcamp':
      album = <BandcampAlbum album={data.tweet} footer={tweet} />
      break
    case 'spotify': {
      if (!('embed' in data)) {
        throw new Error('embed must be present for spotify')
      }

      switch (data.embed.type) {
        case 'album':
          album = <Album album={data.embed} footer={tweet} />
          break
        case 'playlist':
          album = <Playlist playlist={data.embed} footer={tweet} />
          break
      }

      break
    }
  }

  return (
    <Layout
      headerBreadcrumbs={[
        'Twitter',
        [
          `@${data.tweet.username}`,
          <A
            href={`https://twitter.com/${data.tweet.username}`}
            target="_blank"
            className={clsx('normal-case')}
          >{`@${data.tweet.username}`}</A>,
        ],
      ]}
    >
      {album ? album : <Debug data={data} />}
    </Layout>
  )
}
