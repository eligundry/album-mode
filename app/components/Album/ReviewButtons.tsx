import { useWindowSize } from '@react-hookz/web'
import clsx from 'clsx'
import { useState } from 'react'
import Confetti from 'react-confetti'

import { urlWithUTMParams } from '~/lib/queryParams'
import type { LibraryItem } from '~/lib/types/library'

import { ButtonLink, EmojiText, Heading } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import useCurrentPath from '~/hooks/useCurrentPath'
import useGTM from '~/hooks/useGTM'
import useLoading from '~/hooks/useLoading'
import useRating from '~/hooks/useRating'

export interface ReviewButtonProps {
  item: LibraryItem
  className?: string
}

const getPlayURL = (item: LibraryItem) => {
  let rawURL: string | undefined
  let extraParams: Record<string, string> = {}

  switch (item.type) {
    case 'bandcamp':
      rawURL = item.url
      break
    case 'playlist':
      rawURL = item.external_urls.spotify
      extraParams.campaign = 'playlist'
      extraParams.term = 'spotify-playlist'
      extraParams.go = '1'
      break
    case 'album':
      rawURL = item.external_urls.spotify
      extraParams.go = '1'
      break
    default:
      throw new Error('unsupported url for review buttons')
  }

  const url = urlWithUTMParams(rawURL, extraParams)

  return url.toString()
}

const ReviewButtons: React.FC<ReviewButtonProps> = ({ item }) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const { loading } = useLoading()
  const refreshURL = useCurrentPath()
  const sendEvent = useGTM()
  const playURL = getPlayURL(item)

  return (
    <>
      <div className={clsx('flex', 'flex-col', 'gap-2', 'w-full')}>
        {item.type === 'album' && item.genres && item.genres.length > 0 && (
          <>
            <Heading level="h5" noSpacing>
              Genres
            </Heading>
            <ButtonLinkGroup
              items={item.genres.slice(0, 3)}
              keyFunction={(genre) => genre}
              toFunction={(genre) => `/genre?genre=${genre}`}
              childFunction={(genre) => genre}
              className={clsx('btn-xs')}
              wrapperClassName={clsx('mb-2')}
            />
          </>
        )}
        <Heading level="h5" noSpacing>
          Rate to get the next recommendation
        </Heading>
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
            replace={true}
            disabled={loading}
          >
            <EmojiText emoji="🙌" label="raised hands">
              Great!
            </EmojiText>
          </ButtonLink>
          <ButtonLink
            to={refreshURL}
            onClick={() => negativeReview(item)}
            color="danger"
            replace={true}
            disabled={loading}
          >
            <EmojiText
              emoji="👎"
              label="thumbs down"
              className={clsx('mt-1.5')}
            >
              Nope!
            </EmojiText>
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
          <EmojiText emoji="▶️" label="play button">
            Play
          </EmojiText>
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
