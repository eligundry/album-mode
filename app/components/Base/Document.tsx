import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react'

import Tracking from '~/components/Tracking'
import useTailwindTheme from '~/hooks/useTailwindTheme'

const Document: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isDarkMode, pallete } = useTailwindTheme()

  return (
    <html lang="en" data-theme={isDarkMode ? 'dark' : 'light'}>
      <head>
        <Meta />
        <meta name="theme-color" content={pallete['base-100']} />
        <Links />
        <Tracking />
      </head>
      <body id="album-mode-root">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default Document
