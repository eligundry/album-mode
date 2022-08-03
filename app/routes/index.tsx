import promiseHash from 'promise-hash'
import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import auth from '~/lib/auth'
import db from '~/lib/db'
import spotifyLib from '~/lib/spotify'
import { Heading, Layout, Container, Link, ButtonLink } from '~/components/Base'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import ButtonLinkGroup, {
  ButtonLinkGroupWrapper,
} from '~/components/Base/ButtonLinkGroup'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'
import HomeSection from '~/components/Base/HomeSection'
import SavedSearches from '~/components/SavedSearches'
import useSavedSearches from '~/hooks/useSavedSearches'

export async function loader({ request }: LoaderArgs) {
  const authCookie = await auth.getCookie(request)
  const spotify = await spotifyLib.initializeFromRequest(request)

  const data = await promiseHash({
    publications: db.getPublications(),
    topGenres: db.getTopGenres(),
    topArtists: spotify.getTopArtists(),
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
  const { hasSavedSearches } = useSavedSearches()

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
              <p className={clsx('pb-4')}>
                Tired of the same old songs? <br />
                Let us recommend something that you might like.
              </p>
              <ButtonLink to="/random">▶️ Play me someting</ButtonLink>
            </div>
          </div>
        </div>
        <HomeSection
          title="Artist"
          subtitle="Want an album from an artist similar to one you like? What's their name?"
          className="artist"
        >
          <RelatedArtistSearchForm defaultArtists={data.topArtists} />
        </HomeSection>
        <HomeSection
          title={<Link to="/genres">Genre</Link>}
          subtitle="Have a genre in mind? Search for it and we'll find you something."
          className="genre"
        >
          <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'gap-2')}>
            <GenreSearchForm
              defaultGenres={data.topGenres}
              className={clsx('flex-1')}
            />
            <ButtonLink to="/genre/random" className={clsx('self-start')}>
              Random Genre
            </ButtonLink>
          </div>
        </HomeSection>
        <HomeSection
          title="Spotify"
          subtitle="Looking for a familiar favorite? Let's play a random album from your Spotify library."
          className="spotify"
        >
          <ButtonLinkGroupWrapper>
            {data.auth.spotify.loginState ? (
              <SpotifyLoginButton state={data.auth.spotify.loginState} />
            ) : (
              <>
                <ButtonLink to="/spotify/album">Spotify Library</ButtonLink>
                <ButtonLink to="/spotify/currently-playing">
                  Currently Playing
                </ButtonLink>
              </>
            )}
            <ButtonLink to="/spotify/new-releases">New Release</ButtonLink>
            <ButtonLink to="/spotify/featured-playlist">
              Featured Playlist
            </ButtonLink>
            <ButtonLink to="/spotify/categories" color="primary">
              Playlist Categories
            </ButtonLink>
          </ButtonLinkGroupWrapper>
        </HomeSection>
        <HomeSection
          title="Publications"
          subtitle="Play a random album recommended by the pros."
          className="publications"
        >
          <ButtonLinkGroup
            items={data.publications}
            toFunction={(publication) => `/publication/${publication.slug}`}
            keyFunction={(publication) => publication.slug}
            childFunction={(publication) => publication.name}
          />
        </HomeSection>
        {hasSavedSearches && (
          <HomeSection
            title={<Link to="/saved-searches">Saved Searches</Link>}
            subtitle="Revisit a search that you performed on this site."
            className="saved-searches"
          >
            <SavedSearches limit={20} />
          </HomeSection>
        )}
      </Container>
    </Layout>
  )
}
