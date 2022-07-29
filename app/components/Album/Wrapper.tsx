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
      body={<>{footer && <p>{footer}</p>}</>}
      actionsClassName={clsx('flex-col')}
      actions={
        <>
          <h5 className={clsx('uppercase', 'font-bold', 'text-xs')}>
            Rate to get the next recommendation
          </h5>
          <div
            className={clsx(
              'flex',
              'flex-row',
              'flext-wrap',
              'justify-items-end',
              'gap-2',
              'w-full',
              '[&>a]:w-1/2'
            )}
          >
            <ReviewButtons {...reviewProps} />
          </div>
        </>
      }
    />
  )
}

export default AlbumWrapper
