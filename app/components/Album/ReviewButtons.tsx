import { useState } from 'react'
import clsx from 'clsx'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { useLocation } from 'react-router-dom'

import { ButtonGroup, ButtonLink } from '~/components/Base'
import useRating from '~/hooks/useRating'

interface SpotifyProps {
  album: SpotifyApi.AlbumObjectSimplified | SpotifyApi.AlbumObjectFull
}

interface MinimalProps {
  albumURL: string
}

export type ReviewButtonProps = SpotifyProps

const ReviewButtons: React.FC<ReviewButtonProps> = ({ album }) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const { pathname, search } = useLocation()
  const refreshURL = pathname + search
  const albumURL = album.external_urls.spotify
  const artistName = album.artists[0].name

  return (
    <>
      <ButtonLink
        to={refreshURL}
        prefetch="render"
        color="primary"
        onClick={() => {
          positiveReview({
            name: album.name,
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
            name: album.name,
            artist: artistName,
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
