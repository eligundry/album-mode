import { useCallback } from 'react'

import useGTM from '~/hooks/useGTM'
import useLibrary, { LibraryItemInput } from '~/hooks/useLibrary'
import useModal from '~/hooks/useModal'

export default function useRating() {
  const { saveItem } = useLibrary()
  const sendEvent = useGTM()
  const { clearRejections, addRejection } = useModal()

  const positiveReview = useCallback(
    (item: LibraryItemInput) => {
      clearRejections()
      saveItem(item)
      sendEvent({
        event: 'Positive Review',
        albumURL: item.url,
      })
    },
    [sendEvent, saveItem, clearRejections]
  )

  const negativeReview = useCallback(
    (item: LibraryItemInput) => {
      addRejection()
      sendEvent({
        event: 'Negative Review',
        albumURL: item.url,
      })
    },
    [sendEvent, addRejection]
  )

  return { positiveReview, negativeReview }
}
