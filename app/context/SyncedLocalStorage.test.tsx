import { act, renderHook, waitFor } from '@testing-library/react'
import random from 'lodash/random'
import { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserContext } from '~/context/User'

import {
  ISyncedLocalStorageProviderProps,
  SyncedLocalStorageProvider,
  syncedLocalStorageContextFactory,
} from './SyncedLocalStorage'

type Person = {
  name: string
}

describe('SyncedLocalStorage', () => {
  const apiPath = '/api/person'
  const Wrapper: React.FC<
    React.PropsWithChildren<
      Pick<
        ISyncedLocalStorageProviderProps<Person>,
        'Context' | 'localStorageKey'
      > & {
        defaultValue?: ISyncedLocalStorageProviderProps<Person>['defaultValue']
        loggedIn?: boolean
      }
    >
  > = ({ children, Context, localStorageKey, defaultValue = [], loggedIn }) => {
    return (
      <UserContext.Provider
        value={
          loggedIn
            ? {
                id: 'spotify:user:eligundry',
                email: 'eligundry@gmail.com',
                name: 'Eli Gundry',
              }
            : null
        }
      >
        <SyncedLocalStorageProvider
          Context={Context}
          apiPath={apiPath}
          localStorageKey={localStorageKey}
          defaultValue={defaultValue}
        >
          {children}
        </SyncedLocalStorageProvider>
      </UserContext.Provider>
    )
  }

  describe('logged out', () => {
    it('should return an empty array initially', async () => {
      const Context = syncedLocalStorageContextFactory<Person>()

      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper Context={Context} localStorageKey="people-0">
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => expect(result.current.items).toEqual([]))
    })

    it('should return items passed into the factory', async () => {
      const people = [
        { name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]
      const Context = syncedLocalStorageContextFactory<Person>(people)

      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper
            Context={Context}
            defaultValue={people}
            localStorageKey="people-1"
          >
            {children}
          </Wrapper>
        ),
      })

      await waitFor(() => expect(result.current.items).toEqual(people))
    })

    it('should allow for saving of items locally', async () => {
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper Context={Context} localStorageKey="people-2">
            {children}
          </Wrapper>
        ),
      })

      await act(() =>
        result.current.saveItem({
          name: 'Eli Gundry',
        }),
      )

      expect(result.current.items).toHaveLength(1)
    })

    it('should allow for removal of locally saved items', async () => {
      const person = {
        name: 'Eli Gundry',
        savedAt: new Date('2023-01-01'),
      }
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper
            Context={Context}
            defaultValue={[person]}
            localStorageKey="people-3"
          >
            {children}
          </Wrapper>
        ),
      })

      await act(() => result.current.removeItem(person))

      expect(result.current.items).toHaveLength(0)
    })

    it('should allow for removal of items when there are multiple', async () => {
      const people = [
        { name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]
      const newPerson = { name: 'Jane Doe' }
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper
            Context={Context}
            defaultValue={people}
            localStorageKey="people-4"
          >
            {children}
          </Wrapper>
        ),
      })

      await act(() => result.current.saveItem(newPerson))
      expect(result.current.items).toHaveLength(3)

      await act(() => result.current.removeItem(people[0]))
      expect(result.current.items).toHaveLength(2)
    })
  })

  describe('logged in', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = {
        href: 'http://localhost:3001/',
        origin: 'http://localhost:3001',
        protocol: 'http:',
        host: 'localhost:3001',
        hostname: 'localhost',
        port: '3001',
        pathname: '/',
        search: '',
        hash: '',
      }

      vi.restoreAllMocks()
      fetchMock.resetMocks()
    })

    it('should sync a new item to the server', async () => {
      const mock = fetchMock.mockIf(/\/api\/person/, async (req) => {
        if (req.method === 'POST') {
          const input = await req.json()

          return {
            body: JSON.stringify({
              ...input,
              id: random(0, 1000),
            }),
            headers: {
              'content-type': 'application/json',
            },
          }
        }

        return {
          body: JSON.stringify([]),
          headers: {
            'content-type': 'application/json',
          },
        }
      })

      const newPerson = { name: 'Jane Doe' }
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = renderHook(() => useContext(Context), {
        wrapper: ({ children }) => (
          <Wrapper Context={Context} localStorageKey="people-5" loggedIn>
            {children}
          </Wrapper>
        ),
      })

      await act(() => result.current.saveItem(newPerson))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toHaveProperty('id')
      expect(mock).toHaveBeenCalledTimes(3)
    })

    it('should save items from the server not in local storage', async () => {
      const serverPeople = [
        { id: 1, name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { id: 2, name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]
      const localPeople = [
        { id: 3, name: 'Jane Doe', savedAt: new Date('2023-01-03') },
      ]

      const mock = fetchMock.mockIf(/\/api\/person/, async () => {
        return {
          body: JSON.stringify(serverPeople),
          headers: {
            'content-type': 'application/json',
          },
        }
      })

      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper
              Context={Context}
              localStorageKey="people-6"
              loggedIn
              defaultValue={localPeople}
            >
              {children}
            </Wrapper>
          ),
        }),
      )

      expect(result.current.items).toHaveLength(3)
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('should not duplicate items already synced to the server', async () => {
      const serverPeople = [
        { id: 1, name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { id: 2, name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]
      const localPeople = [
        { id: 1, name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { id: 2, name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]

      const mock = fetchMock.mockOnceIf(/\/api\/person/, async () => {
        return {
          body: JSON.stringify(serverPeople),
          headers: {
            'content-type': 'application/json',
          },
        }
      })

      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper
              Context={Context}
              localStorageKey="people-7"
              loggedIn
              defaultValue={localPeople}
            >
              {children}
            </Wrapper>
          ),
        }),
      )

      expect(result.current.items).toHaveLength(2)
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('should sync locally saved items to the server', async () => {
      const localPeople = [
        { name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { name: 'John Doe', savedAt: new Date('2023-01-02') },
      ]
      const serverPeople = [
        { id: 3, name: 'Jane Doe', savedAt: new Date('2023-01-03') },
      ]
      fetchMock.mockIf(/\/api\/person/, async (req) => {
        if (req.method === 'POST') {
          const input = await req.json()

          return {
            body: JSON.stringify({
              ...input,
              id: random(0, 1000),
            }),
            headers: {
              'content-type': 'application/json',
            },
          }
        }

        return {
          body: JSON.stringify(serverPeople),
          headers: {
            'content-type': 'application/json',
          },
        }
      })
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper
              Context={Context}
              localStorageKey="people-7"
              loggedIn
              defaultValue={localPeople}
            >
              {children}
            </Wrapper>
          ),
        }),
      )

      expect(result.current.items).toHaveLength(3)
      result.current.items.forEach((item) => {
        expect(item).toHaveProperty('id')
      })
    })

    it('should save item locally if server request fails', async () => {
      const newPerson = { name: 'Jane Doe' }
      const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => {})
      fetchMock.mockIf(/\/api\/person/, async (req) => {
        if (req.method === 'POST') {
          return {
            body: JSON.stringify({
              error: 'Server error',
            }),
            status: 500,
            headers: {
              'content-type': 'application/json',
            },
          }
        }

        return {
          body: JSON.stringify([]),
          headers: {
            'content-type': 'application/json',
          },
        }
      })
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper Context={Context} localStorageKey="people-8" loggedIn>
              {children}
            </Wrapper>
          ),
        }),
      )

      await act(() =>
        expect(() => result.current.saveItem(newPerson)).rejects.toThrowError(),
      )

      expect(result.current.items).toHaveLength(1)
      expect('id' in result.current.items[0]).toBe(false)
      expect(consoleMock).toHaveBeenCalledTimes(1)
    })

    it('should follow auth redirects', async () => {
      const newPerson = { name: 'Jane Doe' }
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      let redirectCalled = false
      const serverPerson = {
        id: 1,
        savedAt: new Date('2023-01-03'),
        ...newPerson,
      }

      fetchMock.mockIf(/\/api\/person/, async (req) => {
        if (req.method === 'POST') {
          if (!redirectCalled) {
            redirectCalled = true
            return {
              status: 307,
              counter: 1,
              headers: {
                location: '/api/person',
              },
            }
          }

          return {
            status: 201,
            body: JSON.stringify(serverPerson),
            headers: {
              'content-type': 'application/json',
            },
          }
        }

        return {
          body: JSON.stringify([]),
          headers: {
            'content-type': 'application/json',
          },
        }
      })
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper Context={Context} localStorageKey="people-20" loggedIn>
              {children}
            </Wrapper>
          ),
        }),
      )

      await act(() => result.current.saveItem(newPerson))
      expect(result.current.items).toHaveLength(1)
      expect('id' in result.current.items[0]).toBe(true)
    })

    it('should allow the removal of items remotely', async () => {
      const localPeople = [
        { id: 1, name: 'Eli Gundry', savedAt: new Date('2023-01-01') },
        { id: 2, name: 'Jane Doe', savedAt: new Date('2023-01-02') },
      ]
      const mock = fetchMock.mockIf(/\/api\/person/, async (req) => {
        if (req.method === 'DELETE') {
          return {
            status: 204,
          }
        }

        return {
          body: JSON.stringify([]),
          headers: {
            'content-type': 'application/json',
          },
        }
      })
      const Context = syncedLocalStorageContextFactory<Person>()
      const { result } = await act(() =>
        renderHook(() => useContext(Context), {
          wrapper: ({ children }) => (
            <Wrapper
              Context={Context}
              localStorageKey="people-9"
              loggedIn
              defaultValue={localPeople}
            >
              {children}
            </Wrapper>
          ),
        }),
      )

      await act(() => result.current.removeItem(localPeople[0]))

      expect(result.current.items).toHaveLength(1)
      expect(mock).toHaveBeenCalledTimes(2)
    })
  })
})
