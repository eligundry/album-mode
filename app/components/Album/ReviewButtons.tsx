import { useState } from 'react'
import clsx from 'clsx'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'

import { ButtonGroup, ButtonLink, Button } from '~/components/Base'
import useRating from '~/hooks/useRating'
import useWindow from '~/hooks/useWindow'

interface Props {
  albumURL: string
  containerClassName?: string
}

const ReviewButtons: React.FC<Props> = ({ albumURL, containerClassName }) => {
  const [party, setParty] = useState(false)
  const window = useWindow()
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()

  return (
    <>
      <ButtonGroup className={containerClassName}>
        <Button
          color="info"
          onClick={() => {
            positiveReview(albumURL)
            setParty(true)
          }}
          className={clsx('mr-2', 'mb-2', 'md:mb-0')}
        >
          🙌 &nbsp; Great selection, I love it!
        </Button>
        <ButtonLink
          to={window?.location.href.replace(window.location.origin, '') ?? '/'}
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
