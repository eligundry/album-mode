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
              color={false}
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
          <nav
            className={clsx(
              'navbar-end',
              // 'flex-none',
              'flex',
              'justify-items-end',
              'align-center',
              'align-middle',
              'order-2 md:order-3',
              'flex-1'
            )}
          >
            <ul className={clsx('menu', 'menu-horizontal')}>
              <li tabIndex={0}>
                <a>🍔</a>
                <ul className={clsx('bg-base-100', 'z-50', 'shadow-xl')}>
                  <li>
                    <Link to="/library">Library</Link>
                  </li>
                  <li>
                    <Link to="/saved-searches">Saved Searches</Link>
                  </li>
                  <li>
                    <Link to="/about">About</Link>
                  </li>
                  <li>
                    <Link to="/labs">Labs</Link>
                  </li>
                  <li>
                    <A
                      href="mailto:eligundry+album-mode.party@gmail.com"
                      target="_blank"
                    >
                      Contact
                    </A>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </Container>
      </header>
      <main className={clsx('mb-8', className)}>{children}</main>
      <footer className={clsx('mb-4')}>
        <Container>
          <Typography className={clsx('text-right')}>
            Made with ❤️ &nbsp;by{' '}
            <A href="https://eligundry.com" target="_blank">
              Eli Gundry
            </A>
          </Typography>
        </Container>
      </footer>
    </>
  )
}

export default Layout
