import clsx from 'clsx'
import React from 'react'

import { Heading } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import Card from '~/components/Base/Card'

import ReviewButtons from './ReviewButtons'
import type { ReviewButtonProps } from './ReviewButtons'

export interface Props {
  embed: React.ReactNode
  title: React.ReactNode
  footer?: React.ReactNode
  reviewProps: Omit<ReviewButtonProps, 'bottomNav'>
  genres?: string[]
  className?: string
  releaseDate?: string
}

const AlbumWrapper: React.FC<Props> = ({
  embed,
  title,
  footer,
  reviewProps,
  className,
  releaseDate,
  genres,
}) => {
  return (
    <>
      <Card
        className={clsx(
          'mx-auto',
          'sm:card-side',
          'album-card-wrapper',
          'w-full',
          'sm:w-5/6',
          ['min-h-[calc(100vh-6rem)]', 'sm:min-h-fit'],
          ['shadow-none', 'sm:shadow-xl'],
          'phone:pb-[4rem]',
          'phone:rounded-none',
          className
        )}
        media={embed}
        title={title}
        body={footer}
        actionsClassName={clsx('flex-col', 'sticky')}
        actions={
          <>
            <div
              className={clsx(
                'flex',
                'flex-row-reverse',
                'justify-between',
                'w-full'
              )}
            >
              {releaseDate && (
                <h5 className={clsx('uppercase', 'font-bold', 'text-xs')}>
                  Released:{' '}
                  <time dateTime={releaseDate}>
                    {new Date(releaseDate).getFullYear()}
                  </time>
                </h5>
              )}
              {!!genres?.length && (
                <Heading level="h5" noSpacing>
                  Genres
                </Heading>
              )}
            </div>
            {!!genres?.length && (
              <ButtonLinkGroup
                items={genres.slice(0, 3)}
                keyFunction={(genre, i) => `${genre}-${i}`}
                toFunction={(genre) => `/genre/${genre}`}
                childFunction={(genre) => genre}
                className={clsx('btn-xs')}
                wrapperClassName={clsx('mb-2')}
              />
            )}
            <Heading level="h5" noSpacing className={clsx('phone:hidden')}>
              Rate to get the next recommendation
            </Heading>
            <ReviewButtons className={clsx('phone:hidden')} {...reviewProps} />
          </>
        }
      />
      <ReviewButtons className={clsx('sm:hidden')} bottomNav {...reviewProps} />
    </>
  )
}

export default AlbumWrapper
