import promiseHash from 'promise-hash'
import { json, LoaderArgs } from '@remix-run/node'
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
} from '~/components/Base'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'

export async function loader({ request }: LoaderArgs) {
  const authCookie = await auth.getCookie(request)

  const data = await promiseHash({
    publications: db.getPublications(),
    artistGroupings: db.getArtistGroupings(),
    topGenres: db.getTopGenres(),
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
  const data = useLoaderData<typeof loader>()

  return (
    <Layout className={clsx('mt-0')}>
      <Container>
        <div className={clsx('hero', 'place-items-start')}>
          <div
            className={clsx('hero-content', 'flex', 'flex-row-reverse', 'p-0')}
          >
            <img
              src="/img/dancing.png"
              alt="man dancing to music"
              className={clsx('w-48', 'hidden', 'md:block')}
            />
            <div>
              <Heading level="h2" className={clsx('font-black')}>
                It's time for new music
              </Heading>
              <p>
                Tired of the same old songs? <br />
                Let us recommend something that you might like.
              </p>
            </div>
          </div>
        </div>
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
              color="primary"
              className={clsx('mr-2', 'mb-2')}
            >
              Spotify Library
            </ButtonLink>
          )}
          <ButtonLink
            to="/spotify/new-releases"
            color="primary"
            className={clsx('mr-2', 'mb-2')}
          >
            New Release
          </ButtonLink>
          <ButtonLink
            to="/spotify/featured-playlist"
            color="primary"
            className={clsx('mr-2', 'mb-2')}
          >
            Featured Playlist
          </ButtonLink>
          <ButtonLink to="/spotify/categories" color="primary">
            Playlist Categories
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
