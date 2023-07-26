import { Link, LinkProps } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'

import { Heading, HeadingProps } from '~/components/Base'

interface Props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'media' | 'title'> {
  media?: React.ReactNode
  title: React.ReactNode | string
  body?: React.ReactNode
  actions?: React.ReactNode
  mediaZoomOnHover?: boolean
  actionsClassName?: string
  titleLevel?: HeadingProps['level']
}

const cardWrapperClasses = (
  props: Pick<Props, 'mediaZoomOnHover' | 'className'>
) =>
  clsx(
    'card',
    'card-compact',
    !props.className?.includes('shadow') && 'shadow-xl',
    'text-left',
    'overflow-hidden',
    props.mediaZoomOnHover && [
      '[&>img]:hover:scale-105',
      '[&:has(*:active)>img]:hover:scale-105',
      '[&:has(*:focus)>img]:hover:scale-105',
      '[&>img]:ease-in',
      '[&>img]:duration-100',
    ],
    props.className
  )

export const Card = React.forwardRef<any, Props>(
  (
    {
      media,
      title,
      body,
      actions,
      className,
      mediaZoomOnHover,
      titleLevel = 'h2',
      actionsClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cardWrapperClasses({ mediaZoomOnHover, className })}
        ref={ref}
        {...props}
      >
        {media}
        <div className={clsx('card-body', 'sm:justify-between')}>
          <div>
            <Heading
              level={titleLevel}
              noStyles
              className={clsx(
                'card-title',
                'flex-col',
                'items-start',
                'leading-none'
              )}
            >
              {title}
            </Heading>
            {body}
          </div>
          {actions && (
            <div
              className={clsx('card-actions', 'justify-end', actionsClassName)}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)

export const CardLink: React.FC<
  Props & Omit<LinkProps, 'children' | 'media'>
> = ({
  media,
  title,
  body,
  actions,
  className,
  mediaZoomOnHover,
  actionsClassName,
  titleLevel = 'h2',
  ...props
}) => {
  return (
    <Link
      className={cardWrapperClasses({ mediaZoomOnHover, className })}
      {...props}
    >
      {media}
      <div className={clsx('card-body', 'justify-between')}>
        <div>
          <Heading
            level={titleLevel}
            noStyles
            className={clsx(
              'card-title',
              'flex-col',
              'items-start',
              'leading-none'
            )}
          >
            {title}
          </Heading>
          {body}
        </div>
        {actions && (
          <div
            className={clsx(
              'card-actions',
              'justify-end',
              'mt-2',
              actionsClassName
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </Link>
  )
}

export default Card
