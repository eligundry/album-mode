import { useWindowSize } from '@react-hookz/web'
import clsx from 'clsx'
import { useState } from 'react'
import Confetti from 'react-confetti'

import type { LibraryItemInput } from '~/lib/types/library'

import { ButtonLink, EmojiText } from '~/components/Base'
import useCurrentPath from '~/hooks/useCurrentPath'
import useGTM from '~/hooks/useGTM'
import useLoading from '~/hooks/useLoading'
import useRating from '~/hooks/useRating'
import useUTM from '~/hooks/useUTM'

export interface ReviewButtonProps {
  item: LibraryItemInput
  className?: string
  bottomNav?: boolean
}

const ReviewButtons: React.FC<ReviewButtonProps> = ({
  item,
  className,
  bottomNav = false,
}) => {
  const [party, setParty] = useState(false)
  const { positiveReview, negativeReview } = useRating()
  const { width, height } = useWindowSize()
  const { loading } = useLoading()
  const refreshURL = useCurrentPath()
  const sendEvent = useGTM()
  const { createExternalURL } = useUTM()
  const playURL = createExternalURL(item.url)

  return (
    <>
      <div
        className={clsx(
          'grid',
          !bottomNav && [
            'grid-cols-2',
            'w-full',
            'justify-items-stretch',
            'gap-2',
          ],
          bottomNav && [
            'btm-nav',
            'grid-cols-3',
            '[&>.btn]:h-full',
            '[&>.btn]:rounded-none',
            'z-50',
          ],
          className,
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
          <EmojiText emoji="🙌" label="raised hands" noPadding>
            <span className={clsx('btm-nav-label')}>Great!</span>
          </EmojiText>
        </ButtonLink>
        <ButtonLink
          to={refreshURL}
          onClick={() => negativeReview(item)}
          color="danger"
          replace={true}
          disabled={loading}
          className={clsx('order-3', 'sm:order-2')}
        >
          <EmojiText
            emoji="👎"
            label="thumbs down"
            className={clsx('sm:mt-1.5')}
            noPadding
          >
            <span className={clsx('btm-nav-label')}>Nope!</span>
          </EmojiText>
        </ButtonLink>
        <ButtonLink
          href={playURL.toString()}
          color="info"
          className={clsx('sm:col-span-2', ['order-2', 'sm:order-3'])}
          target="_blank"
          onClick={() =>
            sendEvent({
              event: 'Album Opened',
              albumURL: playURL,
            })
          }
        >
          <EmojiText emoji="▶️" label="play button" noPadding>
            <span className={clsx('btm-nav-label')}>Play</span>
          </EmojiText>
        </ButtonLink>
      </div>
      {typeof window !== 'undefined' && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={party ? 500 : 0}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            top: 0,
          }}
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
