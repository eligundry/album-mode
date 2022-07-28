import React from 'react'
import clsx from 'clsx'

import { Container, A, Link, Typography } from './index'
import SearchBreadcrumbs, {
  SearchBreadcrumbsProps,
} from '~/components/SearchBreadcrumbs'

interface LayoutProps {
  className?: string
  headerBreadcrumbs?: SearchBreadcrumbsProps['crumbs']
}

const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  className,
  headerBreadcrumbs,
}) => {
  return (
    <>
      <header className={clsx('navbar', 'pl-0')}>
        <Container
          className={clsx('flex', 'flex-wrap', 'my-4', 'align-center')}
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
              💿 Album Mode.party 🎉
            </Link>
          </h1>
          {headerBreadcrumbs && (
            <SearchBreadcrumbs
              className={clsx(
                'order-3 md:order-2',
                'flex-1',
                'justify-between md:justify-center',
                'ml-2 md:ml-0',
                'basis-1/2'
              )}
              crumbs={headerBreadcrumbs}
            />
          )}
          <div
            className={clsx(
              'navbar-end',
              // 'flex-none',
              'flex',
              'justify-items-end',
              'align-center',
              'align-middle',
              'order-2 md:order-3',
              'flex-1',
              'font-bold'
            )}
          >
            <Link to="/library" colorHover>
              📗 Library
            </Link>
          </div>
        </Container>
      </header>
      <main className={clsx('mb-8', className)}>{children}</main>
      <Container>
        <footer
          className={clsx('footer', 'items-start', 'justify-between', 'py-4')}
        >
          <section>
            <h4 className={clsx('footer-title')}>Party Time</h4>
            <Link to="/about">About</Link>
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
              Made with ❤️ by{' '}
              <A href="https://eligundry.com" target="_blank">
                Eli Gundry
              </A>
            </h4>
          </section>
        </footer>
      </Container>
    </>
  )
}

export default Layout
