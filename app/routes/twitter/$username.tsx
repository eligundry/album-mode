import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db.server'
import spotifyLib from '~/lib/spotify.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { A, Layout } from '~/components/Base'
import Debug from '~/components/Debug'
import TweetEmbed from '~/components/TweetEmbed'
import useUTM from '~/hooks/useUTM'

export async function loader({ params, request }: LoaderArgs) {
  const username = params.username?.trim()

  if (!username) {
    throw json({ error: 'username param must be present' }, 400)
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
          throw json(
            { error: `unsupported spotify embed type ${tweet.itemType}` },
            500
          )
      }

      return json({
        tweet,
        service: 'spotify',
        embed,
      })
    }
    default:
      throw json({ error: `unsupported service ${tweet.service}` }, 400)
  }
}

export const ErrorBoundary = AlbumErrorBoundary

export default function AlbumFromTwitter() {
  const data = useLoaderData<typeof loader>()
  const { createExternalURL } = useUTM()
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

      switch (data.embed?.type) {
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
            href={createExternalURL(
              `https://twitter.com/${data.tweet.username}`
            ).toString()}
            target="_blank"
            className={clsx('normal-case')}
            key="twitter-link"
          >
            @{data.tweet.username}
          </A>,
        ],
      ]}
    >
      {album ? album : <Debug data={data} />}
    </Layout>
  )
}
