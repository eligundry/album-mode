import { useCallback } from 'react'

import useGTM from '~/hooks/useGTM'
import useLibrary, { LibraryItem } from '~/hooks/useLibrary'
import useModal from '~/hooks/useModal'

export default function useRating() {
  const { saveItem } = useLibrary()
  const sendEvent = useGTM()
  const { clearRejections, addRejection } = useModal()

  const positiveReview = useCallback(
    (item: LibraryItem) => {
      const albumURL =
        item.type === 'bandcamp' ? item.url : item.external_urls.spotify

      clearRejections()
      saveItem(item)
      sendEvent({
        event: 'Positive Review',
        albumURL,
      })
    },
    [sendEvent, saveItem, clearRejections]
  )

  const negativeReview = useCallback(
    (item: LibraryItem) => {
      const albumURL =
        item.type === 'bandcamp' ? item.url : item.external_urls.spotify

      addRejection()
      sendEvent({
        event: 'Negative Review',
        albumURL,
      })
    },
    [sendEvent, addRejection]
  )

  return { positiveReview, negativeReview }
}
