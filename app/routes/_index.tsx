import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'
import clsx from 'clsx'
import sample from 'lodash/sample'

import { spotifyStrategy } from '~/lib/auth.server'
import RandomRecommendation from '~/lib/random.server'
import spotifyLib from '~/lib/spotify.server'

import Album from '~/components/Album'
import Playlist from '~/components/Album/Playlist'
import PublicationHeader from '~/components/Album/PublicationHeader'
import { Blockquote, Container, Layout, Link } from '~/components/Base'
import BrowseSections from '~/components/BrowseSections'
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
  const { database, serverTiming } = context
  const session = await spotifyStrategy.getSession(request)
  const options = session ? loggedInOptions : loggedOutOptions
  const variant = sample<(typeof options)[number]>(options)
  const spotify = await spotifyLib.initializeFromRequest(request, context)
  const randomRecommendation = new RandomRecommendation(spotify, database)
  const publications = await database.getPublications()

  return retry(async () => {
    switch (variant) {
      case 'publication': {
        const { album, review, wiki } =
          await randomRecommendation.forAnyPublication()
        return json(
          {
            variant,
            embed: album,
            review,
            wiki,
            publications,
          },
          {
            headers: {
              [serverTiming.headerKey]: serverTiming.toString(),
            },
          },
        )
      }

      case 'featured-playlist': {
        const playlist = await randomRecommendation.forFeaturedPlaylist()
        return json(
          {
            variant,
            embed: playlist,
            publications,
          },
          {
            headers: {
              [serverTiming.headerKey]: serverTiming.toString(),
            },
          },
        )
      }

      case 'top-artists':
      case 'top-artists-relations': {
        const { album, targetArtist, wiki } =
          await randomRecommendation.forUsersTopArtists(
            variant === 'top-artists-relations',
          )

        return json(
          {
            variant,
            embed: album,
            wiki,
            publications,
            targetArtist,
          },
          {
            headers: {
              [serverTiming.headerKey]: serverTiming.toString(),
            },
          },
        )
      }

      default:
        throw new Error(`unsupported option ${variant}`)
    }
  }, config.asyncRetryConfig)
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  let embed: React.ReactNode

  switch (data.variant) {
    case 'publication':
      embed = (
        <Album
          album={data.embed}
          wiki={data.wiki}
          footer={
            <>
              <PublicationHeader
                slug={data.review.publicationSlug}
                review={data.review}
              />
              <Blockquote className={clsx('my-2')}>
                <h6 className={clsx('font-bold')}>Why?</h6>
                <p>
                  We enjoy {data.review.publicationName}'s reviews and you
                  should check this out because they recommend it.
                </p>
                <Link to={`/publication/${data.review.publicationSlug}`}>
                  Get more recommendations from {data.review.publicationName}
                </Link>
              </Blockquote>
            </>
          }
        />
      )
      break
    case 'featured-playlist':
      embed = (
        <Playlist
          playlist={data.embed}
          footer={
            <Blockquote className={clsx('my-2')}>
              <h6 className={clsx('font-bold')}>Why?</h6>
              <p>
                Spotify is currently recommending this playlist to you. It's a
                good way to discover new music.
              </p>
              <Link to="/spotify/featured-playlist">
                Get another featured playlist
              </Link>
            </Blockquote>
          }
        />
      )
      break
    case 'top-artists':
      embed = (
        <Album
          album={data.embed}
          wiki={data.wiki}
          footer={
            <Blockquote className={clsx('my-2')}>
              <h6 className={clsx('font-bold')}>Why?</h6>
              <p>
                You have been listening to {data.targetArtist.name} a lot. Have
                you checked out this album?
              </p>
              <Link to="/spotify/top-artists">
                Get another recommendation based upon your top artists
              </Link>
            </Blockquote>
          }
        />
      )
      break
    case 'top-artists-relations':
      embed = (
        <Album
          album={data.embed}
          wiki={data.wiki}
          footer={
            <Blockquote className={clsx('my-2')}>
              <h6 className={clsx('font-bold')}>Why?</h6>
              <p>
                You have been listening to {data.targetArtist.name} a lot. Fans
                of them also enjoy {data.embed.artists[0].name} as well, so you
                should check this out.
              </p>
              <Link to="/spotify/top-artists">
                Get another recommendation based upon your top artists'
                relations
              </Link>
            </Blockquote>
          }
        />
      )
      break
  }

  return (
    <Layout>
      {embed}
      <Container className={clsx('sm:mt-8')}>
        <BrowseSections publications={data.publications} />
      </Container>
    </Layout>
  )
}
