import clsx from 'clsx'
import { ButtonLink, ButtonLinkProps } from '~/components/Base'

interface Props<T extends any = any> extends Omit<ButtonLinkProps, 'to'> {
  items: T[]
  keyFunction: (item: T) => string
  toFunction: (item: T) => string
  childFunction: (item: T) => string | React.ReactNode
}

function ButtonLinkGroup<T extends any>({
  items,
  keyFunction,
  toFunction,
  childFunction,
  className,
  ...props
}: Props<T>) {
  return (
    <>
      {items.map((item) => (
        <ButtonLink
          to={toFunction(item)}
          key={keyFunction(item)}
          className={clsx('mr-2', 'mb-2', className)}
          {...props}
        >
          {childFunction(item)}
        </ButtonLink>
      ))}
    </>
  )
}

export default ButtonLinkGroup
