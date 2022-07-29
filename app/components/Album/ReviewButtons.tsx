import { useState } from 'react'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import clsx from 'clsx'

import { ButtonLink } from '~/components/Base'
import useRating from '~/hooks/useRating'
import useCurrentPath from '~/hooks/useCurrentPath'
import { LibraryItem } from '~/lib/types/library'
import useGTM from '~/hooks/useGTM'

export interface ReviewButtonProps {
  item: LibraryItem
}

const getPlayURL = (item: LibraryItem) => {
  let rawURL: string | undefined

  switch (item.type) {
    case 'bandcamp':
      rawURL = item.url
      break
    case 'playlist':
    case 'album':
      rawURL = item.external_urls.spotify
      break
    default:
      throw new Error('unsupported url for review buttons')
  }

  const url = new URL(rawURL)
  url.searchParams.set('utm_campaign', 'album-mode.party')

  if (rawURL.includes('spotify.com')) {
    url.searchParams.set('go', '1')
  }

  return url.toString()
}

const ReviewButtons: React.FC<ReviewButtonProps> = ({ item }) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const refreshURL = useCurrentPath()
  const sendEvent = useGTM()
  const playURL = getPlayURL(item)

  return (
    <>
      <div className={clsx('flex', 'flex-col', 'gap-2', 'w-full')}>
        <h5 className={clsx('uppercase', 'font-bold', 'text-xs')}>
          Rate to get the next recommendation
        </h5>
        <div
          className={clsx(
            'grid',
            'grid-cols-2',
            'w-full',
            'justify-items-stretch',
            'gap-2'
          )}
        >
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
        </div>
        <ButtonLink
          href={playURL}
          color="info"
          className={clsx('w-full')}
          target="_blank"
          onClick={() =>
            sendEvent({
              event: 'Album Opened',
              albumURL: playURL,
            })
          }
        >
          ▶️ Play
        </ButtonLink>
      </div>
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
