import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import {
  ButtonLink,
  Container,
  EmojiText,
  Heading,
  Layout,
  Link,
} from '~/components/Base'
import ButtonLinkGroup, {
  ButtonLinkGroupWrapper,
} from '~/components/Base/ButtonLinkGroup'
import HomeSection from '~/components/Base/HomeSection'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import GenreSearchForm from '~/components/Forms/GenreSearch'
import RelatedArtistSearchForm from '~/components/Forms/RelatedArtistSearch'
import SpotifyLoginButton from '~/components/Spotify/LoginButton'
import config from '~/config'
import useLoading from '~/hooks/useLoading'
import useSavedSearches from '~/hooks/useSavedSearches'
import useUser from '~/hooks/useUser'

export async function loader({ context: { database } }: LoaderArgs) {
  return json(
    {
      publications: await database.getPublications(),
    },
    {
      headers: {
        'Cache-Control': config.cacheControl.public,
      },
    },
  )
}

export const ErrorBoundary = PageErrorBoundary

export default function Index() {
  const data = useLoaderData<typeof loader>()
  const { hasSavedSearches, searches } = useSavedSearches()
  const { loading } = useLoading()
  const user = useUser()

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
              width={296}
              height={400}
            />
            <div>
              <Heading level="h2" className={clsx('font-black')}>
                It's time for new music
              </Heading>
              <p className={clsx('pb-4')}>
                Tired of the same old songs? <br />
                Spotify's algorithim know you too well? <br />
                Take a chance on a random album!
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
          <RelatedArtistSearchForm />
        </HomeSection>
        <HomeSection
          title={<Link to="/genres">Genre</Link>}
          subtitle="Have a genre in mind? Search for it and we'll find you something."
          className="genre"
        >
          <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'gap-2')}>
            <GenreSearchForm className={clsx('flex-1')} />
            <ButtonLink
              to="/genre/random"
              className={clsx('self-start', 'btn-sm', 'sm:btn-md')}
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
            {!user ? (
              <SpotifyLoginButton
                size={null}
                className={clsx(
                  'breadcrumbs',
                  ['btn-xs', 'py-0'],
                  ['sm:btn-sm'],
                )}
              />
            ) : (
              <>
                <ButtonLink
                  to="/spotify/library"
                  disabled={loading}
                  className={clsx(
                    'breadcrumbs',
                    ['btn-xs', 'py-0'],
                    ['sm:btn-sm'],
                  )}
                >
                  Spotify Library
                </ButtonLink>
                <ButtonLink
                  to="/spotify/currently-playing"
                  disabled={loading}
                  className={clsx(
                    'breadcrumbs',
                    ['btn-xs', 'py-0'],
                    ['sm:btn-sm'],
                  )}
                >
                  Currently Playing
                </ButtonLink>
                <ButtonLink
                  to="/spotify/top-artists"
                  disabled={loading}
                  className={clsx(
                    'breadcrumbs',
                    ['btn-xs', 'py-0'],
                    ['sm:btn-sm'],
                  )}
                >
                  Top Artists
                </ButtonLink>
                <ButtonLink
                  to="/spotify/top-artists?related=1"
                  disabled={loading}
                  className={clsx(
                    'breadcrumbs',
                    ['btn-xs', 'py-0'],
                    ['sm:btn-sm'],
                  )}
                >
                  Top Artist Relations
                </ButtonLink>
                <ButtonLink
                  to="/spotify/for-you"
                  disabled={loading}
                  className={clsx(
                    'breadcrumbs',
                    ['btn-xs', 'py-0'],
                    ['sm:btn-sm'],
                  )}
                >
                  For You
                </ButtonLink>
              </>
            )}
            <ButtonLink
              to="/spotify/new-releases"
              disabled={loading}
              className={clsx('breadcrumbs', ['btn-xs', 'py-0'], ['sm:btn-sm'])}
            >
              New Release
            </ButtonLink>
            <ButtonLink
              to="/spotify/featured-playlist"
              disabled={loading}
              className={clsx('breadcrumbs', ['btn-xs', 'py-0'], ['sm:btn-sm'])}
            >
              Featured Playlist
            </ButtonLink>
            <ButtonLink
              to="/spotify/categories"
              disabled={loading}
              className={clsx('breadcrumbs', ['btn-xs', 'py-0'], ['sm:btn-sm'])}
            >
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
            className={clsx('breadcrumbs', ['btn-xs', 'py-0'], ['sm:btn-sm'])}
            items={data.publications}
            toFunction={(publication) => `/publication/${publication.slug}`}
            keyFunction={(publication) => publication.slug}
            childFunction={(publication) => publication.name}
            disabled={loading}
          />
        </HomeSection>
        {hasSavedSearches && (
          <HomeSection
            title="Saved Searches"
            subtitle="Revisit a search that you performed on this site."
            className="saved-searches"
          >
            <ButtonLinkGroup
              className={clsx('breadcrumbs', ['btn-xs', 'py-0'], ['sm:btn-sm'])}
              items={searches}
              toFunction={({ path }) => path}
              keyFunction={({ path }) => path}
              childFunction={({ crumbs }) => (
                <ul>
                  {crumbs.map((crumb) => (
                    <li key={crumb}>{crumb}</li>
                  ))}
                </ul>
              )}
              disabled={loading}
            />
          </HomeSection>
        )}
      </Container>
    </Layout>
  )
}
