import clsx from 'clsx'

import { ButtonLink, ButtonLinkProps } from '~/components/Base'

interface Props<T = any> extends Omit<ButtonLinkProps, 'to'> {
  items: T[]
  keyFunction: (item: T, i: number) => string
  toFunction: (item: T, i: number) => string
  childFunction: (item: T, i: number) => string | React.ReactNode
  wrapperClassName?: string
}

function ButtonLinkGroup<T = any>({
  items,
  keyFunction,
  toFunction,
  childFunction,
  className,
  wrapperClassName,
  ...props
}: Props<T>) {
  return (
    <ButtonLinkGroupWrapper className={clsx(wrapperClassName)}>
      {items.map((item, i) => (
        <ButtonLink
          to={toFunction(item, i)}
          key={keyFunction(item, i)}
          className={clsx(className)}
          {...props}
        >
          {childFunction(item, i)}
        </ButtonLink>
      ))}
    </ButtonLinkGroupWrapper>
  )
}

export const ButtonLinkGroupWrapper: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className, children }) => (
  <div
    className={clsx(
      'button-link-group',
      'flex',
      'flex-wrap',
      'flex-row',
      'gap-2',
      className
    )}
  >
    {children}
  </div>
)

export default ButtonLinkGroup
