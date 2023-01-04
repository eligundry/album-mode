import { useCallback } from 'react'

import useGTM from '~/hooks/useGTM'
import useLibrary, { LibraryItem } from '~/hooks/useLibrary'

export default function useRating() {
  const { saveItem } = useLibrary()
  const sendEvent = useGTM()

  const positiveReview = useCallback(
    (item: LibraryItem) => {
      const albumURL =
        item.type === 'bandcamp' ? item.url : item.external_urls.spotify

      saveItem(item)
      sendEvent({
        event: 'Positive Review',
        albumURL,
      })
    },
    [sendEvent, saveItem]
  )

  const negativeReview = useCallback(
    (item: LibraryItem) => {
      const albumURL =
        item.type === 'bandcamp' ? item.url : item.external_urls.spotify

      sendEvent({
        event: 'Negative Review',
        albumURL,
      })
    },
    [sendEvent]
  )

  return { positiveReview, negativeReview }
}
