import promiseHash from 'promise-hash'
import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import auth from '~/lib/auth.server'
import db from '~/lib/db.server'
import spotifyLib from '~/lib/spotify.server'
import lastPresented from '~/lib/lastPresented.server'
import {
  Heading,
  Layout,
  Container,
  Link,
  ButtonLink,
  EmojiText,
} from '~/components/Base'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import ButtonLinkGroup, {
  ButtonLinkGroupWrapper,
} from '~/components/Base/ButtonLinkGroup'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'
import HomeSection from '~/components/Base/HomeSection'
import SavedSearches from '~/components/SavedSearches'
import useSavedSearches from '~/hooks/useSavedSearches'
import useLoading from '~/hooks/useLoading'

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

  const headers = new Headers()
  headers.append('Set-Cookie', await auth.cookieFactory.serialize(authCookie))
  headers.append('Set-Cookie', await lastPresented.clearCookie())

  return json(data, { headers })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  const { hasSavedSearches } = useSavedSearches()
  const { loading } = useLoading()

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
              <ButtonLink to="/random" disabled={loading}>
                <EmojiText emoji="▶️" label="play button">
                  Play me someting
                </EmojiText>
              </ButtonLink>
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
            <ButtonLink
              to="/genre/random"
              className={clsx('self-start')}
              disabled={loading}
            >
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
                <ButtonLink to="/spotify/album" disabled={loading}>
                  Spotify Library
                </ButtonLink>
                <ButtonLink to="/spotify/currently-playing" disabled={loading}>
                  Currently Playing
                </ButtonLink>
              </>
            )}
            <ButtonLink to="/spotify/new-releases" disabled={loading}>
              New Release
            </ButtonLink>
            <ButtonLink to="/spotify/featured-playlist" disabled={loading}>
              Featured Playlist
            </ButtonLink>
            <ButtonLink to="/spotify/categories" disabled={loading}>
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
            disabled={loading}
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
