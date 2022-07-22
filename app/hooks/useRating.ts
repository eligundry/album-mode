import { useCallback, useMemo } from 'react'
import useGTM from '~/hooks/useGTM'
import useLibrary, { LibraryItem } from '~/hooks/useLibrary'

export default function useRating() {
  const { saveItem } = useLibrary()
  const sendEvent = useGTM()

  const positiveReview = useCallback(
    (item: LibraryItem) => {
      saveItem(item)
      sendEvent({
        event: 'Positive Review',
        albumURL: item.external_urls.spotify,
      })
    },
    [sendEvent]
  )

  const negativeReview = useCallback(
    (item: LibraryItem) => {
      sendEvent({
        event: 'Negative Review',
        albumURL: item.external_urls.spotify,
      })
    },
    [sendEvent]
  )

  return useMemo(
    () => ({
      positiveReview,
      negativeReview,
    }),
    [positiveReview, negativeReview]
  )
}
