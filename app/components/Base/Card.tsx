import React from 'react'
import clsx from 'clsx'
import { Link, LinkProps } from '@remix-run/react'

interface Props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'media' | 'title'> {
  media?: React.ReactNode
  title: React.ReactNode | string
  body?: React.ReactNode
  actions?: React.ReactNode
  mediaZoomOnHover?: boolean
  actionsClassName?: string
}

const cardWrapperClasses = (
  props: Pick<Props, 'mediaZoomOnHover' | 'className'>
) =>
  clsx(
    'card',
    'card-compact',
    'shadow-xl',
    'text-left',
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
        <div className={clsx('card-body', 'justify-between')}>
          <div>
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
