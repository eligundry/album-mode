import React from 'react'
import clsx from 'clsx'

import { Container, A, Link, Typography } from './index'

const Layout: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <>
      <header>
        <Container>
          <h1 className={clsx('text-xl', 'font-bold', 'my-4')}>
            <Link
              to="/"
              color={false}
              className={clsx('hover:text-primary', 'hover:no-underline')}
            >
              💿 Album Mode.party 🎉
            </Link>
          </h1>
        </Container>
      </header>
      <main className={clsx('md:mt-8', 'mb-8', 'mt-2', className)}>
        {children}
      </main>
      <footer className={clsx('mb-4')}>
        <Container>
          <Typography>
            <Link to="/about">About</Link> |{' '}
            <A href="mailto:eligundry+album-mode.party@gmail.com">Contact</A> |
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
