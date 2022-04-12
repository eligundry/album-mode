import React from 'react'
import { Link } from '@remix-run/react'
import clsx from 'clsx'

import { Container, A } from './index'

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      <header>
        <Container>
          <h1 className={clsx('text-xl', 'font-bold', 'py-4')}>
            <Link to="/">Album Mode</Link>
          </h1>
        </Container>
      </header>
      <main className={clsx('my-8')}>
        <Container>{children}</Container>
      </main>
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
