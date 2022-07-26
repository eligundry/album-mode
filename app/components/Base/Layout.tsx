import React from 'react'
import clsx from 'clsx'

import { Container, A, ButtonLink, Link, Typography } from './index'

interface LayoutProps {
  className?: string
  headerBreadcrumbs?: React.ReactNode
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
          className={clsx('flex', 'justify-between', 'my-4', 'align-center')}
        >
          <h1 className={clsx('text-xl', 'font-bold', 'whitespace-nowrap')}>
            <Link
              to="/"
              color={false}
              className={clsx('hover:text-primary', 'hover:no-underline')}
            >
              💿 Album Mode.party 🎉
            </Link>
          </h1>
          <nav
            className={clsx(
              'navbar-end',
              'flex-none',
              'flex',
              'justify-items-end',
              'align-center',
              'align-middle'
            )}
          >
            {headerBreadcrumbs}
            <ul className={clsx('menu', 'menu-horizontal')}>
              <li tabIndex={0}>
                <a>🍔</a>
                <ul className={clsx('bg-base-100')}>
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
