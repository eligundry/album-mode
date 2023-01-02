import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LibraryContext from '~/context/Library'
import useLibrary from '~/hooks/useLibrary'
import { defaultLibrary } from '~/lib/types/library'
import SpotifyWebApi from 'spotify-web-api-node'

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

const metro: SpotifyApi.AlbumObjectSimplified = {
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

describe('useLibrary > logged out', () => {
  const getLibraryScope = nock('http://localhost').persist().get('/api/library')

  it('should initialize along the happy path', async () => {
    getLibraryScope.reply(200, defaultLibrary)

    const {
      result: {
        current: { library },
      },
    } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => {
      expect(library).toMatchObject(defaultLibrary.items)
    })
  })

  it('should be able to fetch existing libraries', async () => {
    getLibraryScope.reply(200, {
      ...defaultLibrary,
      items: [{ ...metro, savedAt: new Date().toISOString() }],
    })

    const { result } = renderHook(() => useLibrary(), { wrapper })

    await waitFor(() => {
      expect(result.current.library).toMatchObject([metro])
    })
  })

  it('should save items to the library', async () => {
    getLibraryScope.reply(200, defaultLibrary)

    nock('http://localhost')
      .post('/api/library')
      .reply(201, {
        msg: 'saved item',
        item: { ...metro, savedAt: new Date().toISOString() },
      })

    const { result } = renderHook(() => useLibrary(), { wrapper })

    await waitFor(async () => {
      await result.current.saveItem({ ...metro, type: 'album' })
      expect(result.current.library.length).toBe(1)
    })
  })

  it('should remove items from the library', async () => {
    const savedAt = new Date()

    getLibraryScope.reply(200, {
      ...defaultLibrary,
      items: [{ ...metro, savedAt: savedAt.toISOString() }],
    })

    nock('http://localhost')
      .delete(`/api/library/${savedAt.toISOString()}`)
      .reply(200, {
        msg: 'removed item',
      })

    const { result } = renderHook(() => useLibrary(), { wrapper })

    await waitFor(async () => {
      await result.current.removeItem(savedAt)
    })
  })
})
