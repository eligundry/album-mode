import { useState } from 'react'
import clsx from 'clsx'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { useLocation } from 'react-router-dom'

import { ButtonGroup, ButtonLink } from '~/components/Base'
import useRating from '~/hooks/useRating'

interface SpotifyProps {
  albumName: string
  artistName: string
  albumURL: string
  containerClassName?: string
}

interface MinimalProps {
  albumURL: string
}

export type ReviewButtonProps = SpotifyProps | MinimalProps

const ReviewButtons: React.FC<ReviewButtonProps> = ({
  albumURL,
  albumName,
  artistName,
  containerClassName,
}) => {
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
            positiveReview({
              name: albumName,
              artist: artistName,
              albumURL,
            })
            setParty(true)
          }}
          className={clsx('mr-2', 'mb-2', 'md:mb-0')}
        >
          🙌 &nbsp; Great selection, give me another!
        </ButtonLink>
        <ButtonLink
          to={refreshURL}
          onClick={() =>
            negativeReview({
              name: albumName,
              artist: albumName,
              albumURL,
            })
          }
          color="danger"
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

export const NewReviewButtons: React.FC<ReviewButtonProps> = ({
  albumURL,
  albumName,
  artistName,
}) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const { pathname, search } = useLocation()
  const refreshURL = pathname + search

  return (
    <>
      <ButtonLink
        to={refreshURL}
        color="info"
        onClick={() => {
          positiveReview({
            name: albumName,
            artist: artistName,
            albumURL,
          })
          setParty(true)
        }}
      >
        🙌 &nbsp; Great!
      </ButtonLink>
      <ButtonLink
        to={refreshURL}
        onClick={() =>
          negativeReview({
            name: albumName,
            artist: albumName,
            albumURL,
          })
        }
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
