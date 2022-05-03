import React from 'react'
import { Link } from '@remix-run/react'
import clsx from 'clsx'

import { Container, A } from './index'

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      <header>
        <Container>
          <h1
            className={clsx(
              'text-xl',
              'font-bold',
              'my-4',
              'hover:text-primary'
            )}
          >
            <Link to="/">💿 Album Mode.party 🎉</Link>
          </h1>
        </Container>
      </header>
      <main className={clsx('md:mt-8', 'mb-8', 'mt-2')}>{children}</main>
      <footer>
        <Container>
          Made with ❤️ &nbsp;by{' '}
          <A href="https://eligundry.com" target="_blank">
            Eli Gundry
          </A>
        </Container>
      </footer>
    </>
  )
}

export default Layout
