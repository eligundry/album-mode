import promiseHash from 'promise-hash'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import auth from '~/lib/auth'
import db from '~/lib/db'
import {
  Heading,
  Layout,
  Container,
  Link,
  Typography,
  ButtonLink,
  A,
} from '~/components/Base'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'

type LoaderData = {
  publications: Awaited<ReturnType<typeof db.getPublications>>
  artistGroupings: Awaited<ReturnType<typeof db.getArtistGroupings>>
  topGenres: Awaited<ReturnType<typeof db.getTopGenres>>
  subreddits: Awaited<ReturnType<typeof db.getSubreddits>>
  auth: {
    spotify: {
      loggedIn: boolean
      loginState: string | null
    }
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const authCookie = await auth.getCookie(request)

  const data: LoaderData = await promiseHash({
    publications: db.getPublications(),
    artistGroupings: db.getArtistGroupings(),
    topGenres: db.getTopGenres(),
    subreddits: db.getSubreddits(),
    auth: {
      spotify: {
        loggedIn: 'accessToken' in authCookie.spotify,
        loginState:
          'state' in authCookie.spotify ? authCookie.spotify.state : null,
      },
    },
  })

  return json(data, {
    headers: {
      'Set-Cookie': await auth.cookieFactory.serialize(authCookie),
    },
  })
}

export default function Index() {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('text-center')}>
          Don't know what to listen to?
          <br /> Let us recommend an album.
        </Heading>
        <div className="artist">
          <Heading level="h3" className={clsx('mb-2')}>
            Artist
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Want an album from an artist similar to one you like? What's their
            name?
          </Typography>
          <RelatedArtistSearchForm />
        </div>
        <div className="genre">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/genre">Genre</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Have a genre in mind? Search for it and we'll find you something.
          </Typography>
          <GenreSearchForm defaultGenres={data.topGenres} />
        </div>
        <div className="spotify">
          <Heading level="h3" className={clsx('mb-2')}>
            Spotify
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Looking for a familiar favorite? Let's play a random album from your
            Spotify library.
          </Typography>
          {data.auth.spotify.loginState ? (
            <SpotifyLoginButton
              state={data.auth.spotify.loginState}
              className={clsx('mr-2', 'mb-2')}
            />
          ) : (
            <ButtonLink
              to="/spotify/album"
              color="info"
              className={clsx('inline-block', 'mr-2', 'mb-2')}
            >
              Pick Me Something From My Spotify Library
            </ButtonLink>
          )}
          <ButtonLink
            to="/spotify/new-releases"
            color="info"
            className={clsx('inline-block')}
          >
            New Release
          </ButtonLink>
        </div>
        <div className="publications">
          <Heading level="h3" className={clsx('mb-2')}>
            Publications
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            Play a random album recommended by the pros.
          </Typography>
          <ButtonLinkGroup
            items={data.publications}
            toFunction={(publication) => `/publication/${publication.slug}`}
            keyFunction={(publication) => publication.slug}
            childFunction={(publication) => publication.name}
          />
        </div>
        <div className="subreddits">
          <Heading level="h3" className={clsx('mb-2')}>
            Reddit
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            What is the frontpage of the internet listening to?{' '}
            <A href="https://www.reddit.com/r/Music/wiki/musicsubreddits">
              Here's a huge list of music subreddits.
            </A>
          </Typography>
          <ButtonLinkGroup
            items={data.subreddits}
            toFunction={(subreddit) => `/reddit/${subreddit}`}
            keyFunction={(subreddit) => subreddit}
            childFunction={(subreddit) => `/r/${subreddit}`}
          />
        </div>
        <div className="labels">
          <Heading level="h3" className={clsx('mb-2')}>
            <Link to="/label">Labels</Link>
          </Heading>
          <Typography variant="hint" className={clsx('mb-2')}>
            You know labels? Search and we'll see what we have. Otherwise, the
            link above has some ones to check out.
          </Typography>
          <LabelSearchForm />
        </div>
      </Container>
    </Layout>
  )
}
