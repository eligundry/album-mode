import React from 'react'
import { ClientOnly } from 'remix-utils/client-only'

import { cn } from '~/lib/util'

import AutoAlert from '~/components/AutoAlert'
import SuperHeaderSearch from '~/components/Forms/SuperHeaderSearch'
import { DesktopLoader, MobileLoader } from '~/components/Loading'
import SearchBreadcrumbs, {
  SearchBreadcrumbsProps,
} from '~/components/SearchBreadcrumbs'
import useLoading from '~/hooks/useLoading'
import { useIsMobile } from '~/hooks/useMediaQuery'

import { A, Container, EmojiText, Link } from './index'

interface LayoutProps {
  className?: string
  headerBreadcrumbs?: SearchBreadcrumbsProps['crumbs']
  hideFooter?: boolean
}

const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  className,
  headerBreadcrumbs,
  hideFooter = false,
}) => {
  const { loading } = useLoading()
  const isMobile = useIsMobile()

  return (
    <>
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
          className={cn(
            'flex',
            'flex-wrap',
            ['pt-0', 'md:pt-2'],
            'align-center',
            'has-[input:focus]:[&>:not(.super-search)]:hidden',
          )}
        >
          <h1
            className={cn(
              'text-xl',
              'font-bold',
              'whitespace-nowrap',
              'order-1',
              'mr-auto',
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
      <main
        className={cn('md:my-4', 'px-4', className)}
        aria-live="polite"
        aria-busy={loading}
      >
        {headerBreadcrumbs && (
          <SearchBreadcrumbs
            className={cn(
              // TODO Figure out how we should display these
              'hidden',
              '[&>.breadcrumbs]:md:py-0',
            )}
            crumbs={headerBreadcrumbs}
          />
        )}
        {children}
      </main>
      {!hideFooter && (
        <Container>
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
        </Container>
      )}
      <AutoAlert />
      <ClientOnly>{() => isMobile && <MobileLoader />}</ClientOnly>
    </>
  )
}

export default Layout
