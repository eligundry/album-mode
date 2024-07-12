import { useClickOutside } from '@react-hookz/web'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import React, { useMemo } from 'react'
import { ClientOnly } from 'remix-utils/client-only'

import { getRequestContextValues } from '~/lib/context.server'
import { cn } from '~/lib/util'

import AutoAlert from '~/components/AutoAlert'
import { A, ButtonLink, Container, EmojiText, Link } from '~/components/Base'
import { ButtonLinkGroupWrapper } from '~/components/Base/ButtonLinkGroup'
import HomeSection from '~/components/Base/HomeSection'
import SuperHeaderSearch from '~/components/Forms/SuperHeaderSearch'
import { DesktopLoader, MobileLoader } from '~/components/Loading'
import config from '~/config'
import useLoading from '~/hooks/useLoading'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useSavedSearches from '~/hooks/useSavedSearches'
import useUser from '~/hooks/useUser'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { database } = getRequestContextValues(request, context)

  return json(
    { publications: await database.getPublications() },
    {
      headers: {
        'Cache-Control': config.cacheControl.public,
      },
    },
  )
}

const Layout: React.FC = () => {
  const { loading } = useLoading()
  const isMobile = useIsMobile()

  return (
    <>
      <DesktopHeader />
      <main
        className={cn('md:my-4', 'px-4')}
        aria-live="polite"
        aria-busy={loading}
      >
        <Outlet />
      </main>
      <AutoAlert />
      <ClientOnly>{() => isMobile && <MobileLoader />}</ClientOnly>
    </>
  )
}

function useNavSections() {
  const user = useUser()
  const { publications } = useLoaderData<typeof loader>()
  const { searches: savedSearches } = useSavedSearches()

  return useMemo(() => {
    const sections = {
      spotify: [
        {
          label: 'New Releases',
          to: '/spotify/new-releases',
        },
        {
          label: 'Featured Playlist',
          to: '/spotify/featured-playlist',
        },
        {
          label: 'Playlist Categories',
          to: '/spotify/categories',
        },
      ],
      publications: publications.map((publication) => ({
        label: publication.name,
        to: `/publication/${publication.slug}`,
      })),
      savedSearches,
    }

    if (user) {
      sections.spotify.unshift(
        {
          label: 'Currently Playing',
          to: '/spotify/currently-playing',
        },
        {
          label: 'Top Artists',
          to: '/spotify/top-artists',
        },
        {
          label: 'Top Artists Relations',
          to: '/spotify/top-artists-relations',
        },
        {
          label: 'For You',
          to: '/spotify/for-you',
        },
      )
    } else {
      sections.spotify.unshift({
        label: 'Spotify Login',
        to: '',
      })
    }

    return sections
  }, [user, publications, savedSearches])
}

const DesktopHeader: React.FC = () => {
  const navSections = useNavSections()
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const navRef = React.useRef<HTMLDivElement>(null)

  useClickOutside(navRef, () => setDropdownOpen(false))

  console.log({ dropdownOpen })

  return (
    <header
      className={cn(
        'navbar',
        ['px-4', 'md:px-0'],
        ['pt-4', 'md:pt-0'],
        'flex',
        'flex-col',
      )}
    >
      <DesktopLoader />
      <Container
        className={cn('flex', 'flex-wrap', ['pt-0', 'md:pt-2'], 'align-center')}
      >
        <div
          className={cn(
            'dropdown dropdown-end absolute w-full',
            dropdownOpen ? 'dropdown-open' : '[&>.dropdown-content]:invisible',
          )}
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              setDropdownOpen((prev) => !prev)
            }}
            className={cn(
              'btn btn-square btn-sm btm-nav-sm btn-ghost mr-2 !p-0',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <nav
            ref={navRef}
            className={cn(
              'dropdown-content bg-base-100 w-full z-10 pb-2 px-2 mt-2',
              'border-x-2 border-b-2 border-primary border-solid rounded-xl',
            )}
            onClick={(e) => {
              if (e.target instanceof HTMLAnchorElement) {
                setDropdownOpen(false)
              }
            }}
          >
            <HomeSection title="Spotify" subtitle="">
              <ButtonLinkGroupWrapper>
                {navSections.spotify.map(({ label, to }) => {
                  return (
                    <ButtonLink
                      key={to}
                      to={to}
                      className={cn(['btn-xs', 'py-0'], ['sm:btn-sm'])}
                    >
                      {label}
                    </ButtonLink>
                  )
                })}
              </ButtonLinkGroupWrapper>
            </HomeSection>
            <HomeSection title="Publications" subtitle="">
              <ButtonLinkGroupWrapper>
                {navSections.publications.map(({ label, to }) => {
                  return (
                    <ButtonLink
                      key={to}
                      to={to}
                      className={cn(['btn-xs', 'py-0'], ['sm:btn-sm'])}
                    >
                      {label}
                    </ButtonLink>
                  )
                })}
              </ButtonLinkGroupWrapper>
            </HomeSection>
            <footer
              className={cn(
                'footer',
                'items-start',
                'justify-between',
                'py-4',
                'px-4',
                'sm:px-0',
              )}
            >
              <section>
                <h4 className={cn('footer-title')}>Party Time</h4>
                <Link to="/about">About</Link>
                <Link to="/help">Help</Link>
                <A
                  href="mailto:eligundry+album.mode.party@gmail.com"
                  target="_blank"
                >
                  Contact
                </A>
                <Link to="/labs">Labs</Link>
              </section>
              <section>
                <h4 className={cn('footer-title')}>
                  Made with <EmojiText emoji="❤️" label="heart" noPadding /> by{' '}
                  <A href="https://eligundry.com" target="_blank">
                    Eli Gundry
                  </A>
                </h4>
              </section>
            </footer>
          </nav>
        </div>
        <h1
          className={cn(
            'text-xl',
            'font-bold',
            'whitespace-nowrap',
            'order-1',
            'ml-12',
            'mr-auto',
            'z-20',
          )}
        >
          <Link
            to="/"
            colorHover
            className={cn('hover:text-primary', 'hover:no-underline')}
          >
            <EmojiText emoji="💿" label="compact disk" />
            Album Mode.party{' '}
            <EmojiText emoji="🎉" label="party streamer" noPadding />
          </Link>
        </h1>
        <SuperHeaderSearch
          className={cn(
            'navbar-end',
            'flex',
            'justify-items-end',
            'align-center',
            'align-middle',
            'order-2 md:order-3',
            'flex-1',
            'font-bold',
            'super-search',
          )}
        />
      </Container>
    </header>
  )
}

export default Layout
