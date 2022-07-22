import clsx from 'clsx'

interface Props<T extends 'a' | 'div' | 'section' = 'div'>
  extends React.HTMLAttributes<HTMLAnchorElement> {
  component?: T
  media?: React.ReactNode
  title: React.ReactNode | string
  body?: React.ReactNode
  actions?: React.ReactNode
}

export const Card: React.FC<Props> = ({
  component = 'div',
  media,
  title,
  body,
  actions,
  className,
  ...props
}) => {
  const Wrapper = component

  return (
    <Wrapper
      className={clsx(
        'card',
        'card-compact',
        'shadow-xl',
        'text-left',
        className
      )}
      {...props}
    >
      {media}
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
        {body}
        {actions && (
          <div className={clsx('card-actions', 'justify-end', 'mt-2')}>
            {actions}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default Card
