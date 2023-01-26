import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db.server'
import { badRequest, serverError } from '~/lib/responses.server'
import spotifyLib from '~/lib/spotify.server'

import Album from '~/components/Album'
import BandcampAlbum from '~/components/Album/Bandcamp'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import Playlist from '~/components/Album/Playlist'
import { A, Layout } from '~/components/Base'
import Debug from '~/components/Debug'
import TweetEmbed from '~/components/TweetEmbed'
import useUTM from '~/hooks/useUTM'

export async function loader({
  params,
  request,
  context: { logger, serverTiming },
}: LoaderArgs) {
  const username = params.username?.trim()

  if (!username) {
    throw badRequest({ error: 'username param must be present', logger })
  }

  const tweet = await serverTiming.track('db.getRandomTweet', () =>
    db.getRandomTweet(username)
  )

  switch (tweet.service) {
    case 'bandcamp': {
      return json(
        {
          tweet,
          service: 'bandcamp',
          type: 'album',
        },
        {
          headers: {
            [serverTiming.headerKey]: serverTiming.toString(),
          },
        }
      )
    }
    case 'spotify': {
      const spotify = await serverTiming.track('spotify.init', () =>
        spotifyLib.initializeFromRequest(request).then((s) => s.getClient())
      )
      let embed:
        | SpotifyApi.PlaylistObjectSimplified
        | SpotifyApi.AlbumObjectSimplified
        | undefined

      switch (tweet.itemType) {
        case 'playlist': {
          embed = await serverTiming.track('spotify.getPlaylist', () =>
            spotify.getPlaylist(tweet.albumID).then((resp) => resp.body)
          )
          break
        }
        case 'album':
        case 'track': {
          embed = await serverTiming.track('spotify.getAlbum', () =>
            spotify.getAlbum(tweet.albumID).then((resp) => resp.body)
          )
          break
        }
        default:
          throw serverError({
            error: `unsupported spotify embed type ${tweet.itemType}`,
            logger,
          })
      }

      return json(
        {
          tweet,
          service: 'spotify',
          embed,
        },
        {
          headers: {
            [serverTiming.headerKey]: serverTiming.toString(),
          },
        }
      )
    }
    default:
      throw badRequest({
        error: `unsupported service ${tweet.service}`,
        logger,
        headers: {
          [serverTiming.headerKey]: serverTiming.toString(),
        },
      })
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
