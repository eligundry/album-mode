import { useLocation } from '@remix-run/react'
import React, { useCallback, useMemo } from 'react'

const defaultValue = {
  params: new URLSearchParams({
    utm_source: 'album-mode.party',
  }),
  createExternalURL: (rawURL: string, extraParams?: Record<string, string>) => {
    const url = new URL(rawURL)

    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      )
    }

    return url
  },
}

export const UTMParametersContext = React.createContext(defaultValue)

const UTMParametersProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { pathname, search } = useLocation()
  const params = useMemo(() => {
    const params = new URLSearchParams({
      utm_source: 'album-mode.party',
    })

    if (!pathname) {
      return params
    }

    const currentParams = new URLSearchParams(search.slice(1))
    const [campaign, term, content] = pathname.split('/').filter(Boolean)

    if (!campaign) {
      return params
    }

    params.set('utm_campaign', campaign)
    params.set('utm_term', term)

    if (content) {
      params.set('utm_content', content)
    }

    const fromParam = currentParams.get('from')

    if (fromParam) {
      params.set('utm_medium', fromParam)
    }

    return params
  }, [pathname, search])

  const createExternalURL = useCallback(
    (rawURL: string, extraParams?: Record<string, string>) => {
      const url = new URL(rawURL)
      params.forEach((value, key) => url.searchParams.set(key, value))

      if (extraParams) {
        Object.entries(extraParams).forEach(([key, value]) =>
          url.searchParams.set(key, value),
        )
      }

      if (url.hostname === 'open.spotify.com') {
        url.searchParams.set('go', '1')
      }

      return url
    },
    [params],
  )

  return (
    <UTMParametersContext.Provider value={{ params, createExternalURL }}>
      {children}
    </UTMParametersContext.Provider>
  )
}

export default UTMParametersProvider
