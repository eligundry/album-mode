import React from 'react'
import clsx from 'clsx'

import Card from '~/components/Base/Card'
import ReviewButtons, { ReviewButtonProps } from './ReviewButtons'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  embed: React.ReactNode
  title: React.ReactNode
  footer?: React.ReactNode
  reviewProps: ReviewButtonProps
  className?: string
}

const AlbumWrapper = React.forwardRef<any, Props>(
  ({ embed, title, footer, reviewProps, className }, ref) => {
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
          <ReviewButtons
            className={clsx(isMobile && ['sticky', 'bottom-0'])}
            {...reviewProps}
          />
        }
        // style={isMobile ? { height: 'calc(100vh - 150px)' } : undefined}
        ref={ref}
      />
    )
  }
)

export default AlbumWrapper
