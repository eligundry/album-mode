import { useLocalStorageValue } from '@react-hookz/web'
import { useLocation } from '@remix-run/react'
import React, { useCallback, useEffect, useMemo } from 'react'

import useLibrary from '~/hooks/useLibrary'
import useUser from '~/hooks/useUser'

export enum ModalKeys {
  RandomIsBad = 'RandomIsBad',
  YouShouldLoginAttempt1 = 'YouShouldLoginAttempt1',
  YouShouldLoginAttempt2 = 'YouShouldLoginAttempt2',
  YouShouldAutomaticallyFollowArtistsAttempt1 = 'YouShouldAutomaticallyFollowArtistsAttempt1',
  YouShouldAutomaticallyFollowArtistsAttempt2 = 'YouShouldAutomaticallyFollowArtistsAttempt2',
}

interface ModalState {
  neverShowModals: boolean
  consecutiveRejectionCount: number
  dismissedModals: Set<ModalKeys>
}

interface UseModals {
  addRejection: () => void
  clearRejections: () => void
  visibleModal: ModalKeys | null
}

const defaultState: ModalState = {
  neverShowModals: false,
  consecutiveRejectionCount: 0,
  dismissedModals: new Set(),
}

export const ModalContext = React.createContext<UseModals>({
  addRejection: () =>
    console.warn('addRejection called without the ModalProvider being mounted'),
  clearRejections: () =>
    console.warn(
      'clearRejections called without the ModalProvider being mounted'
    ),
  visibleModal: null,
})

const ModalProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { library } = useLibrary()
  const user = useUser()
  const location = useLocation()
  const currentQueryParams = useMemo(
    () => new URLSearchParams(location.search.substring(1)),
    [location.search]
  )
  const { value: state, set } = useLocalStorageValue<ModalState>('modals', {
    initializeWithValue: true,
    defaultValue: defaultState,
    stringify: (value) =>
      JSON.stringify(value, (key, value) => {
        if (key === 'dismissedModals') {
          return Array.from(value)
        }
        return value
      }),
    parse: (value, fallback) => {
      if (!value) {
        return fallback
      }

      return JSON.parse(value, (key, value) => {
        if (key === 'dismissedModals') {
          return new Set(value)
        }

        return value
      })
    },
  })

  const possibleModal = useMemo<UseModals['visibleModal']>(() => {
    if (!state) {
      return null
    }

    console.log({ random: currentQueryParams.get('from') })

    if (
      currentQueryParams.get('from') === 'random' &&
      state.consecutiveRejectionCount === 3
    ) {
      return ModalKeys.RandomIsBad
    }

    if (!user) {
      switch (library.length) {
        case 5:
          return ModalKeys.YouShouldLoginAttempt1
        case 20:
          return ModalKeys.YouShouldLoginAttempt2
      }
    }

    return null
  }, [state, currentQueryParams, user, library.length])

  const visibleModal = useMemo(() => {
    if (!possibleModal) {
      return null
    }

    if (possibleModal === ModalKeys.RandomIsBad) {
      return possibleModal
    }

    return !state?.dismissedModals.has(possibleModal) ? possibleModal : null
  }, [possibleModal, state?.dismissedModals])

  const addRejection = useCallback(
    () =>
      set((v = defaultState) => ({
        ...v,
        consecutiveRejectionCount: v.consecutiveRejectionCount + 1,
      })),
    [set]
  )

  const clearRejections = useCallback(
    () => set((v = defaultState) => ({ ...v, consecutiveRejectionCount: 0 })),
    [set]
  )

  // Navigating to the homepage will always clear the rejections
  useEffect(() => {
    if (location.pathname === '/') {
      clearRejections()
    }
  }, [location.pathname, clearRejections])

  console.log({ visibleModal })

  return (
    <ModalContext.Provider
      value={{
        addRejection,
        clearRejections,
        visibleModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
