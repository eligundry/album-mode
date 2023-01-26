import { useLocation } from '@remix-run/react'
import React, { useCallback, useMemo } from 'react'

const defaultValue = {
  params: new URLSearchParams({
    utm_source: 'album-mode.party',
  }),
  createExternalURL: (rawURL: string) => new URL(rawURL),
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
    const [campaign, term] = pathname.split('/').filter(Boolean)

    if (!campaign) {
      return params
    }

    params.set('utm_campaign', campaign)

    if (term) {
      params.set('utm_term', term)
    } else if (campaign === 'genre') {
      const genre = currentParams.get('genre')

      if (genre) {
        params.set('utm_term', genre)
      }
    } else if (campaign === 'related-artist') {
      const artistID = currentParams.get('artistID')
      const artistName = currentParams.get('artist')

      if (artistID) {
        params.set('utm_term', 'artistID')
        params.set('utm_content', artistID)
      } else if (artistName) {
        params.set('utm_term', 'artist')
        params.set('utm_content', artistName)
      }
    }

    const fromParam = currentParams.get('from')

    if (fromParam) {
      params.set('utm_medium', fromParam)
    }

    return params
  }, [pathname, search])

  const createExternalURL = useCallback(
    (rawURL: string) => {
      const url = new URL(rawURL)
      params.forEach((value, key) => url.searchParams.set(key, value))

      if (url.hostname === 'open.spotify.com') {
        url.searchParams.set('go', '1')
      }

      return url
    },
    [params]
  )

  return (
    <UTMParametersContext.Provider value={{ params, createExternalURL }}>
      {children}
    </UTMParametersContext.Provider>
  )
}

export default UTMParametersProvider
