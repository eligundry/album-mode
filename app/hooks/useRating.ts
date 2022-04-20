import { useCallback, useMemo } from 'react'
import useGTM from '~/hooks/useGTM'

export default function useRating() {
  const sendEvent = useGTM()

  const positiveReview = useCallback(
    (albumURL: string) => {
      sendEvent({
        event: 'Positive Review',
        albumURL,
      })
    },
    [sendEvent]
  )

  const negativeReview = useCallback(
    (albumURL: string) => {
      sendEvent({
        event: 'Negative Review',
        albumURL,
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
