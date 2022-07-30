import React from 'react'
import clsx from 'clsx'

import Card from '~/components/Base/Card'
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
    />
  )
}

export default AlbumWrapper
