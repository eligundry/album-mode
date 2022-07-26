import { useState } from 'react'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'

import { ButtonLink } from '~/components/Base'
import useRating from '~/hooks/useRating'
import useCurrentPath from '~/hooks/useCurrentPath'
import { LibraryItem } from '~/lib/types/library'

export interface ReviewButtonProps {
  item: LibraryItem
}

const ReviewButtons: React.FC<ReviewButtonProps> = ({ item }) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const refreshURL = useCurrentPath()

  return (
    <>
      <ButtonLink
        to={refreshURL}
        prefetch="render"
        color="primary"
        onClick={() => {
          positiveReview(item)
          setParty(true)
        }}
      >
        🙌 &nbsp; Great!
      </ButtonLink>
      <ButtonLink
        to={refreshURL}
        onClick={() => negativeReview(item)}
        color="danger"
      >
        👎 &nbsp; Nope!
      </ButtonLink>
      {typeof window !== 'undefined' && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={party ? 500 : 0}
          style={{ pointerEvents: 'none' }}
          onConfettiComplete={(confetti) => {
            setParty(false)
            confetti?.reset()
          }}
        />
      )}
    </>
  )
}

export default ReviewButtons
