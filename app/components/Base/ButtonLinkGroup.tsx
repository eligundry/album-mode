import clsx from 'clsx'
import { ButtonLink, ButtonLinkProps } from '~/components/Base'

interface Props<T extends any = any> extends Omit<ButtonLinkProps, 'to'> {
  items: T[]
  keyFunction: (item: T) => string
  toFunction: (item: T) => string
  childFunction: (item: T) => string | React.ReactNode
  wrapperClassName?: string
}

function ButtonLinkGroup<T extends any>({
  items,
  keyFunction,
  toFunction,
  childFunction,
  className,
  wrapperClassName,
  ...props
}: Props<T>) {
  return (
    <div
      className={clsx(
        'button-link-group',
        'flex',
        'flex-wrap',
        'flex-row',
        'gap-2',
        wrapperClassName
      )}
    >
      {items.map((item) => (
        <ButtonLink
          to={toFunction(item)}
          key={keyFunction(item)}
          className={clsx(className)}
          {...props}
        >
          {childFunction(item)}
        </ButtonLink>
      ))}
    </div>
  )
}

export default ButtonLinkGroup
