import React from 'react'
import clsx from 'clsx'

import { Container, A, Link, ButtonLink, EmojiText } from './index'
import SearchBreadcrumbs, {
  SearchBreadcrumbsProps,
} from '~/components/SearchBreadcrumbs'
import { DesktopLoader, MobileLoader } from '~/components/Loading'
import useLoading from '~/hooks/useLoading'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface LayoutProps {
  className?: string
  headerBreadcrumbs?: SearchBreadcrumbsProps['crumbs']
}

const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  className,
  headerBreadcrumbs,
}) => {
  const { loading } = useLoading()
  const isMobile = useIsMobile()

  return (
    <>
      <header
        className={clsx(
          'navbar',
          ['px-4', 'md:px-0'],
          ['pt-4', 'md:pt-0'],
          'flex',
          'flex-col'
        )}
      >
        {!isMobile && <DesktopLoader />}
        <Container
          className={clsx(
            'flex',
            'flex-wrap',
            ['pt-0', 'md:pt-2'],
            'align-center'
          )}
        >
          <h1
            className={clsx(
              'text-xl',
              'font-bold',
              'whitespace-nowrap',
              'order-1',
              'mr-auto'
            )}
          >
            <Link
              to="/"
              colorHover
              className={clsx('hover:text-primary', 'hover:no-underline')}
            >
              <EmojiText emoji="💿" label="compact disk" />
              Album Mode.party{' '}
              <EmojiText emoji="🎉" label="party streamer" noPadding />
            </Link>
          </h1>
          {headerBreadcrumbs && (
            <SearchBreadcrumbs
              className={clsx(
                ['order-3', 'md:order-2'],
                'flex-1',
                ['justify-between', 'md:justify-center'],
                'basis-1/2',
                '[&>.breadcrumbs]:md:py-0'
              )}
              crumbs={headerBreadcrumbs}
            />
          )}
          <div
            className={clsx(
              'navbar-end',
              'flex',
              'justify-items-end',
              'align-center',
              'align-middle',
              'order-2 md:order-3',
              'flex-1',
              'font-bold'
            )}
          >
            <ButtonLink to="/library" size="sm">
              <EmojiText
                emoji="📗"
                label="green book"
                className={clsx('mt-0.5')}
              >
                Library
              </EmojiText>
            </ButtonLink>
          </div>
        </Container>
      </header>
      <main
        className={clsx('md:my-4', 'px-4', className)}
        aria-live="polite"
        aria-busy={loading}
      >
        {children}
      </main>
      <Container>
        <footer
          className={clsx(
            'footer',
            'items-start',
            'justify-between',
            'py-4',
            'px-4',
            'sm:px-0'
          )}
        >
          <section>
            <h4 className={clsx('footer-title')}>Party Time</h4>
            <Link to="/about">About</Link>
            <Link to="/Help">Help</Link>
            <A
              href="mailto:eligundry+album.mode.party@gmail.com"
              target="_blank"
            >
              Contact
            </A>
            <Link to="/labs">Labs</Link>
          </section>
          <section>
            <h4 className={clsx('footer-title')}>
              Made with <EmojiText emoji="❤️" label="heart" noPadding /> by{' '}
              <A href="https://eligundry.com" target="_blank">
                Eli Gundry
              </A>
            </h4>
          </section>
        </footer>
      </Container>
      {isMobile && <MobileLoader />}
    </>
  )
}

export default Layout
