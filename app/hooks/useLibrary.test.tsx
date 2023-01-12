import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import React from 'react'
import SpotifyWebApi from 'spotify-web-api-node'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { defaultLibrary } from '~/lib/types/library'

import LibraryContext from '~/context/Library'
import useLibrary from '~/hooks/useLibrary'

import { server } from '../../tests/mocks/server'

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
  it('should initialize along the happy path', async () => {
    server.use(
      rest.get(/\/api\/library/, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(defaultLibrary))
      })
    )

    const hook = renderHook(() => useLibrary(), { wrapper })
    hook.rerender()

    await waitFor(() => {
      expect(hook.result.current.library).toMatchObject(defaultLibrary.items)
    })
  })

  it('should be able to fetch existing libraries', async () => {
    server.use(
      rest.get(/\/api\/library/, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            ...defaultLibrary,
            items: [{ ...metro, savedAt: new Date().toISOString() }],
          })
        )
      })
    )

    const hook = renderHook(() => useLibrary(), { wrapper })
    hook.rerender()

    await waitFor(() => {
      expect(hook.result.current.library).toMatchObject([metro])
    })
  })

  it('should save items to the library', async () => {
    server.use(
      rest.get(/\/api\/library/, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(defaultLibrary))
      }),
      rest.post(/\/api\/library/, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            msg: 'saved item',
            item: { ...metro, savedAt: new Date().toISOString() },
          })
        )
      })
    )

    const hook = renderHook(() => useLibrary(), { wrapper })
    await hook.result.current.saveItem({ ...metro, type: 'album' })

    await waitFor(async () => {
      hook.rerender()
      expect(hook.result.current.library).toHaveLength(1)
    })
  })

  it('should remove items from the library', async () => {
    const savedAt = new Date()

    server.use(
      rest.get(/\/api\/library/, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            ...defaultLibrary,
            items: [{ ...metro, savedAt: new Date().toISOString() }],
          })
        )
      }),
      rest.delete(
        `http://localhost/api/library/${savedAt.toISOString()}`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              msg: 'removed item',
            })
          )
        }
      )
    )

    const hook = renderHook(() => useLibrary(), { wrapper })

    await waitFor(() => {
      hook.rerender()
      expect(hook.result.current.library).toHaveLength(1)
    })

    await hook.result.current.removeItem(savedAt)

    await waitFor(async () => {
      hook.rerender()
      expect(hook.result.current.library).toHaveLength(0)
    })
  })
})
