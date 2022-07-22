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
      className={clsx('lg:w-1/3', 'mx-auto')}
      media={embed}
      title={title}
      body={<>{footer && <p>{footer}</p>}</>}
      actions={<ReviewButtons {...reviewProps} />}
    />
  )
}

export default AlbumWrapper
