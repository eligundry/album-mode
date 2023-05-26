import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

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

export async function loader({ params, request, context }: LoaderArgs) {
  const { logger, serverTiming, database } = context
  const username = params.username?.trim()

  if (!username) {
    throw badRequest({ error: 'username param must be present', logger })
  }

  const tweet = await serverTiming.track('db.getRandomTweet', () =>
    database.getRandomReviewedItem({ reviewerSlug: username })
  )

  switch (tweet.service) {
    case 'bandcamp': {
      return json(
        {
          tweet,
          service: 'bandcamp' as const,
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
        spotifyLib
          .initializeFromRequest(request, context)
          .then((s) => s.getClient())
      )

      if (!tweet.reviewMetadata?.spotify) {
        throw new Error('tweet.service = "spotify" must have spotify metadata')
      }

      const { itemID, itemType } = tweet.reviewMetadata.spotify

      let embed:
        | SpotifyApi.PlaylistObjectSimplified
        | SpotifyApi.AlbumObjectSimplified
        | undefined

      switch (itemType) {
        case 'playlist':
          embed = await serverTiming.track('spotify.getPlaylist', () =>
            spotify.getPlaylist(itemID).then((resp) => resp.body)
          )
          break

        case 'album':
        case 'track': {
          embed = await serverTiming.track('spotify.getAlbum', () =>
            spotify.getAlbum(itemID).then((resp) => resp.body)
          )
          break
        }
        default:
          throw serverError({
            error: `unsupported spotify embed type ${itemType}`,
            logger,
          })
      }

      return json(
        {
          tweet,
          service: 'spotify' as const,
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
  const tweet = data.tweet.reviewMetadata?.twitter?.id ? (
    <TweetEmbed tweetID={data.tweet.reviewMetadata.twitter.id} />
  ) : null
  let album = null

  if (data.service === 'bandcamp' && data.tweet.reviewMetadata?.bandcamp) {
    album = (
      <BandcampAlbum
        album={{
          album: data.tweet.album,
          albumID: data.tweet.reviewMetadata.bandcamp.albumID,
          artist: data.tweet.artist,
          imageURL: data.tweet.reviewMetadata.imageURL ?? null,
          url: data.tweet.reviewMetadata.bandcamp.url,
        }}
        footer={tweet}
      />
    )
  } else if (
    data.service === 'spotify' &&
    data.tweet.reviewMetadata?.spotify &&
    data?.embed
  ) {
    switch (data.embed.type) {
      case 'album':
        album = <Album album={data.embed} footer={tweet} />
        break
      case 'playlist':
        album = <Playlist playlist={data.embed} footer={tweet} />
        break
    }
  }

  switch (data.service) {
    case 'bandcamp':
      break
    case 'spotify': {
      if (!('embed' in data)) {
        throw new Error('embed must be present for spotify')
      }

      break
    }
  }

  return (
    <Layout
      headerBreadcrumbs={[
        'Twitter',
        [
          `@${data.tweet.publicationName}`,
          <A
            href={createExternalURL(
              `https://twitter.com/${data.tweet.publicationName}`
            ).toString()}
            target="_blank"
            className={clsx('normal-case')}
            key="twitter-link"
          >
            @{data.tweet.publicationName}
          </A>,
        ],
      ]}
    >
      {album ? album : <Debug data={data} />}
    </Layout>
  )
}
