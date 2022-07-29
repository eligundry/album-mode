import clsx from 'clsx'
import { Link, LinkProps } from '@remix-run/react'

interface BaseProps {
  media?: React.ReactNode
  title: React.ReactNode | string
  body?: React.ReactNode
  actions?: React.ReactNode
  mediaZoomOnHover?: boolean
  actionsClassName?: string
}

interface Props<T extends 'a' | 'div' | 'section' = 'div'>
  extends React.HTMLAttributes<HTMLAnchorElement>,
    BaseProps {
  component?: T
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
      '[&>img]:ease-in',
      '[&>img]:duration-100',
    ],
    props.className
  )

export const Card: React.FC<Props> = ({
  component = 'div',
  media,
  title,
  body,
  actions,
  className,
  mediaZoomOnHover,
  actionsClassName,
  ...props
}) => {
  const Wrapper = component

  return (
    <Wrapper
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
    </Wrapper>
  )
}

export const CardLink: React.FC<BaseProps & Omit<LinkProps, 'children'>> = ({
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
