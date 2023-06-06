import {
  useAsync,
  useLocalStorageValue as useLocalStorage,
  useMountEffect,
} from '@react-hookz/web'
import dateCompareDesc from 'date-fns/compareDesc'
import React, { useCallback, useEffect, useState } from 'react'

import { ItemInput, LocalItem, ServerItem } from '~/lib/types/library'

import useUser from '~/hooks/useUser'

type SyncedItem = {
  id?: number
  savedAt: Date
}

interface ISyncedLocalStorageContext<T extends SyncedItem> {
  items: (ServerItem<T> | LocalItem<T>)[]
  saveItem: (item: ItemInput<T>) => Promise<void>
  removeItem: (item: ServerItem<T> | LocalItem<T>) => Promise<void>
}

export function syncedLocalStorageContextFactory<T extends SyncedItem>() {
  return React.createContext<ISyncedLocalStorageContext<T>>({
    items: [],
    saveItem: async (item) => {
      console.warn('called saveItem without a Provider', { item })
    },
    removeItem: async (item) => {
      console.warn('called removeItem without a Provider', { item })
    },
  })
}

interface ISyncedLocalStorageProviderProps<T extends SyncedItem> {
  Context: React.Context<ISyncedLocalStorageContext<T>>
  apiPath: string
  localStorageKey: string
  getIdentifier?: (item: LocalItem<T> | ServerItem<T>) => string | number
}

export function SyncedLocalStorageProvider<T extends SyncedItem>({
  children,
  Context,
  apiPath,
  localStorageKey,
  getIdentifier = (item) => {
    return item.savedAt.getTime()
  },
}: React.PropsWithChildren<ISyncedLocalStorageProviderProps<T>>) {
  const user = useUser()
  const [loadedServerItems, setLoadedServerItems] = useState(false)
  const { value: items, set: setItems } = useLocalStorage<T[]>(
    localStorageKey,
    {
      defaultValue: [],
      initializeWithValue: true,
      stringify: (value) => JSON.stringify(value),
      parse: (value, fallback) => {
        if (!value) {
          return fallback
        }

        return JSON.parse(value, (key, value) => {
          if (key === 'savedAt') {
            return new Date(value)
          }

          return value
        })
      },
    }
  )

  const saveItem = useCallback<ISyncedLocalStorageContext<T>['saveItem']>(
    async (item) => {
      const savedItem = { ...item, savedAt: new Date() }

      setItems((localItems) => {
        const updatedItems = Array.isArray(localItems) ? localItems : []
        updatedItems.push(savedItem)
        return updatedItems
      })

      if (user?.id) {
        const resp = await fetch(apiPath, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(savedItem),
        })
        const updatedItem = await resp.json()

        setItems((localItems) => {
          const updatedItems = Array.isArray(localItems)
            ? localItems.filter(
                (item) => item.savedAt.getTime() !== savedItem.savedAt.getTime()
              )
            : []
          updatedItems.push(updatedItem)
          return updatedItems
        })
      }
    },
    [user?.id, setItems, apiPath]
  )

  const removeItem = useCallback<ISyncedLocalStorageContext<T>['removeItem']>(
    async (item) => {
      const { savedAt } = item
      setItems((localItems) => {
        const updatedItems = Array.isArray(localItems)
          ? localItems.filter(
              (item) => item.savedAt.getTime() !== savedAt.getTime()
            )
          : []

        return updatedItems
      })

      if ('id' in item && item.id && user?.id) {
        await fetch(`${apiPath}/${item.id}`, {
          method: 'DELETE',
        })
      }
    },
    [apiPath, user?.id, setItems]
  )

  /**
   * Effect that fetches the library from the server, syncs unsaved items to it,
   * and then merges them together. This allows the library to by synced across
   * devices, if the user is logged in via Spotify.
   */
  const [itemSyncState, remoteItemSync] = useAsync(async () => {
    if (loadedServerItems || !items || !user?.id) {
      return
    }

    const resp = await fetch(apiPath)
    const serverItems: ServerItem<T>[] = await resp.json()
    const serverItemIDs = serverItems.map((item) => getIdentifier(item))
    const unsavedItems = items.filter(
      (item) => !serverItemIDs.includes(getIdentifier(item)) && !('id' in item)
    )

    const syncedItems = await Promise.all(
      unsavedItems.map(async (localItem): Promise<ServerItem<T> | false> => {
        const resp = await fetch(apiPath, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(localItem),
        })

        if (!resp.ok) {
          return false
        }

        const savedItem = await resp.json()

        return savedItem
      })
    ).then((items) => items.filter((item): item is any => !!item))

    setItems([...serverItems, ...syncedItems])
    setLoadedServerItems(true)
  })

  useMountEffect(() => {
    remoteItemSync.execute()
  })

  useEffect(() => {
    console.error('could not fetch items', itemSyncState.error)
  }, [itemSyncState.error])

  return (
    <Context.Provider
      value={{
        items: Array.isArray(items)
          ? (items ?? []).sort((a, b) => dateCompareDesc(a.savedAt, b.savedAt))
          : [],
        saveItem,
        removeItem,
      }}
    >
      {children}
    </Context.Provider>
  )
}
