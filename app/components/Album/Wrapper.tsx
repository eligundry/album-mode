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
}

const AlbumWrapper = React.forwardRef<any, Props>(
  ({ embed, title, footer, reviewProps }, ref) => {
    const isMobile = useIsMobile()
    return (
      <Card
        className={clsx(
          'mx-auto',
          'sm:card-side',
          'album-card-wrapper',
          'w-full',
          'sm:w-3/4'
        )}
        media={embed}
        title={title}
        body={footer}
        actionsClassName={clsx('flex-col')}
        actions={<ReviewButtons {...reviewProps} />}
        style={isMobile ? { height: 'calc(100vh - 150px)' } : undefined}
        ref={ref}
      />
    )
  }
)

export default AlbumWrapper
