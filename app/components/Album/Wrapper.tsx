import React from 'react'
import clsx from 'clsx'

import ReviewButtons, { ReviewButtonProps } from './ReviewButtons'

interface Props {
  embed: React.ReactNode
  title: React.ReactNode
  footer?: React.ReactNode
  reviewProps: ReviewButtonProps
}

const AlbumWrapper: React.FC<Props> = ({
  embed,
  title,
  footer,
  reviewProps,
}) => {
  return (
    <div
      className={clsx(
        'card',
        'card-compact',
        'shadow-xl',
        'text-left',
        'lg:w-1/3',
        'mx-auto'
      )}
    >
      {embed}
      <div className={clsx('card-body')}>
        <h2
          className={clsx(
            'card-title',
            'flex-col',
            'items-start',
            'leading-none'
          )}
        >
          {title}
        </h2>
        {footer && <p>{footer}</p>}
        <div className={clsx('card-actions', 'justify-end', 'mt-2')}>
          <ReviewButtons {...reviewProps} />
        </div>
      </div>
    </div>
  )
}

export default AlbumWrapper
