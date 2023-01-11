import {
  MutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import dateCompareDesc from 'date-fns/compareDesc'
import datesEqual from 'date-fns/isEqual'
import parseISO from 'date-fns/parseISO'
import uniqBy from 'lodash/uniqBy'
import React, { useCallback, useMemo } from 'react'

import {
  CurrentLibrary,
  CurrentLibraryVersion,
  Library,
  LibraryItem,
  SavedLibraryItem,
  defaultLibrary,
} from '~/lib/types/library'

import useUser from '~/hooks/useUser'

export interface ILibraryContext {
  library: Library['items']
  saveItem: MutateFunction<
    SavedLibraryItem,
    unknown,
    LibraryItem | SavedLibraryItem,
    unknown
  >
  removeItem: MutateFunction<void, unknown, Date | string, unknown>
}

export const LibraryContext = React.createContext<ILibraryContext>({
  library: [],
  // @ts-ignore
  saveItem: async (item) => {
    console.warn('called saveItem without a LibraryProvider', { item })
  },
  removeItem: async (item) => {
    console.warn('called removeItem without a LibraryProvider', { item })
  },
})

const reactQueryKey = ['newLibrary']

const LibraryProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const user = useUser()
  const queryClient = useQueryClient()
  const { data: library, ...libs } = useQuery<CurrentLibrary>(
    reactQueryKey,
    async (context) => {
      const resp = await fetch(`${window.location.origin}/api/library`)
      const serverLibrary: CurrentLibrary = await resp.json()
      // const serverLibraryItemsSavedAt = serverLibrary.items.map((item) =>
      //   typeof item.savedAt === 'string'
      //     ? item.savedAt
      //     : item.savedAt.toISOString()
      // )

      // await Promise.all(
      //   library.items.map(async (localItem) => {
      //     const shouldBySynced =
      //       !serverLibraryItemsSavedAt.includes(
      //         localItem.savedAt.toISOString()
      //       ) &&
      //       !serverLibrary?.removedItemTimestamps?.includes(
      //         localItem.savedAt.toISOString()
      //       )
      //
      //     if (!shouldBySynced) {
      //       return
      //     }
      //
      //     fetch('/api/library', {
      //       method: 'POST',
      //       headers: {
      //         'content-type': 'application/json',
      //       },
      //       body: JSON.stringify(localItem),
      //     })
      //   })
      // )

      return serverLibrary
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<CurrentLibrary>(reactQueryKey, (old) => {
          if (old) {
            old.items = old.items.map((item) => ({
              ...item,
              savedAt: new Date(item.savedAt),
            }))
          }

          return old
        })
      },
    }
  )

  // console.log({ ...libs, newLibrary })

  const saveItem = useMutation({
    mutationKey: ['saveItem'],
    mutationFn: async (
      item: LibraryItem | SavedLibraryItem
    ): Promise<SavedLibraryItem> => {
      const savedItem = {
        savedAt: new Date(),
        ...item,
      }

      if (!user) {
        return savedItem
      }

      return fetch(`${window.location.origin}/api/library`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(savedItem),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw resp
          }

          return resp.json()
        })
        .then((data) => data.item as SavedLibraryItem)
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CurrentLibrary>(reactQueryKey, (old) => {
        if (!old) {
          old = { ...defaultLibrary }
        }

        old.items.push(data)
        return old
      })
    },
  })

  const removeItem = useMutation({
    mutationKey: ['removeItem'],
    mutationFn: async (savedAt: Date | string) => {
      const strSavedAt =
        typeof savedAt === 'string' ? savedAt : savedAt.toISOString()

      if (user?.id) {
        await fetch(`/api/library/${strSavedAt}`, {
          method: 'DELETE',
        })
      }
    },
    // @TODO this is not removing items
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CurrentLibrary>(reactQueryKey, (old) => {
        if (!old) {
          old = { ...defaultLibrary }
        }

        old.items = old.items.filter(
          (l) =>
            !datesEqual(
              // @ts-ignore
              typeof l.date === 'string' ? parseISO(l.date) : l.date,
              typeof variables === 'string' ? parseISO(variables) : variables
            )
        )
        old.removedItemTimestamps.push(variables.toString())
        return old
      })
    },
  })

  /**
   * Effect that fetches the library from the server, syncs unsaved items to it,
   * and then merges them together. This allows the library to by synced across
   * devices, if the user is logged in via Spotify.
   */
  // const librarySyncState = useAsync(async () => {
  //   if (loadedServerLibrary || !library || !user?.uri) {
  //     return
  //   }
  //
  //   const resp = await fetch('/api/library')
  //   const serverLibrary: CurrentLibrary = await resp.json()
  //   const serverLibraryItemsSavedAt = serverLibrary.items.map((item) =>
  //     typeof item.savedAt === 'string'
  //       ? item.savedAt
  //       : item.savedAt.toISOString()
  //   )
  //
  //   await Promise.all(
  //     library.items.map(async (localItem) => {
  //       const shouldBySynced =
  //         !serverLibraryItemsSavedAt.includes(
  //           localItem.savedAt.toISOString()
  //         ) &&
  //         !serverLibrary?.removedItemTimestamps?.includes(
  //           localItem.savedAt.toISOString()
  //         )
  //
  //       if (!shouldBySynced) {
  //         return
  //       }
  //
  //       fetch('/api/library', {
  //         method: 'POST',
  //         headers: {
  //           'content-type': 'application/json',
  //         },
  //         body: JSON.stringify(localItem),
  //       })
  //     })
  //   )
  //
  //   setLibrary(mergeLibraryItems(library, serverLibrary))
  //   setLoadedServerLibrary(true)
  // }, [loadedServerLibrary, user?.uri])

  const value = useMemo<ILibraryContext>(
    () => ({
      library: library?.items
        ? library?.items.sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))
        : [],
      saveItem: saveItem.mutateAsync,
      removeItem: removeItem.mutateAsync,
    }),
    [library, saveItem.mutateAsync, removeItem.mutateAsync]
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

const mergeLibraryItems = (
  localLibrary: Library,
  serverLibrary: Library
): CurrentLibrary => {
  const newRemovedAtTimeStamps = Array.from(
    new Set([
      ...('removedItemTimestamps' in localLibrary
        ? localLibrary.removedItemTimestamps
        : []),
      ...('removedItemTimestamps' in serverLibrary
        ? serverLibrary.removedItemTimestamps
        : []),
    ])
  )
  let newLibraryItems = [
    ...serverLibrary.items.map((item) => ({
      ...item,
      savedAt:
        typeof item.savedAt === 'string'
          ? parseISO(item.savedAt)
          : item.savedAt,
    })),
    ...localLibrary.items,
  ]
  newLibraryItems = uniqBy(newLibraryItems, (item) =>
    item.savedAt.toISOString()
  )
    .filter(
      (item) =>
        !newRemovedAtTimeStamps.includes(
          typeof item.savedAt === 'string'
            ? item.savedAt
            : item.savedAt.toISOString()
        )
    )
    .sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))

  return {
    version: CurrentLibraryVersion,
    items: newLibraryItems,
    removedItemTimestamps: newRemovedAtTimeStamps,
  }
}

export default LibraryProvider
