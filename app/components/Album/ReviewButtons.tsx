import { useState } from 'react'
import clsx from 'clsx'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { useLocation } from 'react-router-dom'

import { ButtonGroup, ButtonLink } from '~/components/Base'
import useRating from '~/hooks/useRating'

interface Props {
  albumURL: string
  containerClassName?: string
}

const ReviewButtons: React.FC<Props> = ({ albumURL, containerClassName }) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const { pathname, search } = useLocation()
  const refreshURL = pathname + search

  return (
    <>
      <ButtonGroup className={containerClassName}>
        <ButtonLink
          to={refreshURL}
          color="info"
          onClick={() => {
            positiveReview(albumURL)
            setParty(true)
          }}
          className={clsx('mr-2', 'mb-2', 'md:mb-0', 'inline-block')}
        >
          🙌 &nbsp; Great selection, give me another!
        </ButtonLink>
        <ButtonLink
          to={refreshURL}
          onClick={() => negativeReview(albumURL)}
          color="danger"
          className={clsx('inline-block')}
        >
          👎 &nbsp; Not interested, give me another
        </ButtonLink>
      </ButtonGroup>
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
