import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import UTMParametersProvider from '~/context/UTMParameters'
import useUTM from '~/hooks/useUTM'

vi.mock('@remix-run/react', () => ({
  useLocation: vi.fn(),
}))

describe('useUTM', () => {
  const wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
    <UTMParametersProvider>{children}</UTMParametersProvider>
  )

  const mockLocation = async (rawURL: string) => {
    // @ts-ignore
    const { useLocation } = await import('@remix-run/react')
    const url = new URL(rawURL)
    // @ts-ignore
    useLocation.mockReturnValue({
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      state: {},
      key: 'key',
    })
  }

  interface TestCase {
    it: string
    url: string
    params: Record<string, string>
    embedURL?: string
  }

  const testCases: TestCase[] = [
    {
      it: 'home page',
      url: 'http://localhost:3000',
      params: {},
    },
    {
      it: 'publication',
      url: 'https://album-mode.party/publication/p4k-8-plus',
      params: {
        utm_campaign: 'publication',
        utm_term: 'p4k-8-plus',
      },
      embedURL: 'https://open.spotify.com/album/1ehwJGN59cUxk9LuHRHJdv',
    },
    {
      it: 'user saved albums',
      url: 'https://album-mode.party/spotify/album',
      params: {
        utm_campaign: 'spotify',
        utm_term: 'album',
      },
      embedURL: 'https://open.spotify.com/album/42yMykOCXz25bPe1FpeDds',
    },
    {
      it: 'Spotify featured playlist',
      url: 'https://album-mode.party/spotify/featured-playlist',
      params: {
        utm_campaign: 'spotify',
        utm_term: 'featured-playlist',
      },
      embedURL: 'https://open.spotify.com/playlist/37i9dQZF1DXdVyc8LtLi96',
    },
    {
      it: 'genre',
      url: 'https://album-mode.party/genre/5th+wave+emo',
      params: {
        utm_campaign: 'genre',
        utm_term: '5th+wave+emo',
      },
      embedURL: 'https://open.spotify.com/artist/0NvYpRJfbFyOI4QdsLJ1Jw',
    },
    {
      it: 'random genre',
      url: 'https://album-mode.party/genre/5th+wave+emo?from=random',
      params: {
        utm_campaign: 'genre',
        utm_term: '5th+wave+emo',
        utm_medium: 'random',
      },
      embedURL: 'https://open.spotify.com/artist/0NvYpRJfbFyOI4QdsLJ1Jw',
    },
    {
      it: 'related artist by ID',
      url: 'http://localhost:3000/spotify/artist-id/610dMJUjtyxC9ZrS30iZrX',
      params: {
        utm_campaign: 'spotify',
        utm_term: 'artist-id',
        utm_content: '610dMJUjtyxC9ZrS30iZrX',
      },
      // Home Is Where Forever
      embedURL: 'https://open.spotify.com/album/5w6i8dUJIaYA7UrkejpZeF',
    },
    {
      it: 'related artist by name',
      url: 'http://localhost:3000/spotify/artist/home%20is%20where',
      params: {
        utm_campaign: 'spotify',
        utm_term: 'artist',
        utm_content: encodeURIComponent('home is where'),
      },
    },
    {
      it: 'twitter',
      url: 'http://localhost:3000/twitter/FranziaMom',
      params: {
        utm_campaign: 'twitter',
        utm_term: 'FranziaMom',
      },
    },
  ]

  describe('params', () => {
    it.each(testCases)('$it', async ({ url, params: testParams }) => {
      await mockLocation(url)
      const {
        result: {
          current: { params },
        },
      } = renderHook(() => useUTM(), { wrapper })
      expect(Object.fromEntries(params)).toMatchObject({
        ...testParams,
        utm_source: 'album-mode.party',
      })
    })
  })

  describe('createExternalURL', () => {
    it.each(testCases)('$it', async ({ url, params, embedURL }) => {
      if (!embedURL) {
        return
      }

      await mockLocation(url)

      const {
        result: {
          current: { createExternalURL },
        },
      } = renderHook(() => useUTM(), { wrapper })

      const externalURL = createExternalURL(embedURL)

      expect(Object.fromEntries(externalURL.searchParams)).toMatchObject({
        ...params,
        utm_source: 'album-mode.party',
        go: '1',
      })
    })
  })
})
