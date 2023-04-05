import clsx from 'clsx'
import React from 'react'

import Card from '~/components/Base/Card'
import { useIsMobile } from '~/hooks/useMediaQuery'

import ReviewButtons from './ReviewButtons'
import type { ReviewButtonProps } from './ReviewButtons'

interface Props {
  embed: React.ReactNode
  title: React.ReactNode
  footer?: React.ReactNode
  reviewProps: ReviewButtonProps
  className?: string
  releaseDate?: string
}

const AlbumWrapper = React.forwardRef<any, Props>(
  ({ embed, title, footer, reviewProps, className, releaseDate }, ref) => {
    const isMobile = useIsMobile()
    return (
      <Card
        className={clsx(
          'mx-auto',
          'sm:card-side',
          'album-card-wrapper',
          'w-full',
          'sm:w-3/4',
          className
        )}
        media={embed}
        title={title}
        body={footer}
        actionsClassName={clsx('flex-col')}
        actions={
          <>
            {releaseDate && (
              <h5 className={clsx('uppercase', 'font-bold', 'text-xs')}>
                Released:{' '}
                <time dateTime={releaseDate}>
                  {new Date(releaseDate).toLocaleDateString()}
                </time>
              </h5>
            )}
            <ReviewButtons
              className={clsx(isMobile && ['sticky', 'bottom-0'])}
              {...reviewProps}
            />
          </>
        }
        // style={isMobile ? { height: 'calc(100vh - 150px)' } : undefined}
        ref={ref}
      />
    )
  }
)

export default AlbumWrapper
