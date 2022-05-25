import { useCallback, useMemo } from 'react'
import useGTM from '~/hooks/useGTM'
import useAlbumLibrary, { SavedAlbum } from '~/hooks/useAlbumLibrary'

type Payload = Omit<SavedAlbum, 'savedAt'>

export default function useRating() {
  const { addAlbum } = useAlbumLibrary()
  const sendEvent = useGTM()

  const positiveReview = useCallback(
    (payload: Payload) => {
      addAlbum(payload)
      sendEvent({
        event: 'Positive Review',
        albumURL: payload.albumURL,
      })
    },
    [sendEvent]
  )

  const negativeReview = useCallback(
    (payload: Payload) => {
      sendEvent({
        event: 'Negative Review',
        albumURL: payload.albumURL,
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
