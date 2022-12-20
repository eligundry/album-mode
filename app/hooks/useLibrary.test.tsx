import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LibraryContext from '~/context/Library'
import useLibrary from '~/hooks/useLibrary'
import { defaultLibrary } from '~/lib/types/library'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <LibraryContext>{children}</LibraryContext>
  </QueryClientProvider>
)

const metro = {
  savedAt: '2022-12-17T09:06:55.125Z',
  album_type: 'album',
  artists: [
    {
      external_urls: {
        spotify: 'https://open.spotify.com/artist/0iEtIxbK0KxaSlF7G42ZOp',
      },
      href: 'https://api.spotify.com/v1/artists/0iEtIxbK0KxaSlF7G42ZOp',
      id: '0iEtIxbK0KxaSlF7G42ZOp',
      name: 'Metro Boomin',
      type: 'artist',
      uri: 'spotify:artist:0iEtIxbK0KxaSlF7G42ZOp',
    },
    {
      external_urls: {
        spotify: 'https://open.spotify.com/artist/1URnnhqYAYcrqrcwql10ft',
      },
      href: 'https://api.spotify.com/v1/artists/1URnnhqYAYcrqrcwql10ft',
      id: '1URnnhqYAYcrqrcwql10ft',
      name: '21 Savage',
      type: 'artist',
      uri: 'spotify:artist:1URnnhqYAYcrqrcwql10ft',
    },
  ],
  external_urls: {
    spotify: 'https://open.spotify.com/album/3IO8IPjwXuzPJnoaqkwYrj',
  },
  href: 'https://api.spotify.com/v1/albums/3IO8IPjwXuzPJnoaqkwYrj',
  id: '3IO8IPjwXuzPJnoaqkwYrj',
  images: [
    {
      height: 640,
      url: 'https://i.scdn.co/image/ab67616d0000b2732887f8c05b5a9f1cb105be29',
      width: 640,
    },
    {
      height: 300,
      url: 'https://i.scdn.co/image/ab67616d00001e022887f8c05b5a9f1cb105be29',
      width: 300,
    },
    {
      height: 64,
      url: 'https://i.scdn.co/image/ab67616d000048512887f8c05b5a9f1cb105be29',
      width: 64,
    },
  ],
  name: 'NOT ALL HEROES WEAR CAPES (Deluxe)',
  release_date: '2018-11-06',
  release_date_precision: 'day',
  total_tracks: 26,
  type: 'album',
  uri: 'spotify:album:3IO8IPjwXuzPJnoaqkwYrj',
}

describe('useLibrary', () => {
  it('should initialize along the happy path', async () => {
    nock('http://localhost').get('/api/library').reply(200, defaultLibrary)

    const { result } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => {
      expect(result.current.library).toMatchObject(defaultLibrary.items)
    })
  })

  it('should be able to fetch existing libraries', async () => {
    nock('http://localhost')
      .get('/api/library')
      .reply(200, {
        ...defaultLibrary,
        items: [metro],
      })

    const { result } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => {
      expect(result.current.library).toMatchObject([metro])
    })
  })
})
