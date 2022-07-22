import clsx from 'clsx'
import { ButtonLink } from '~/components/Base'

interface Props<T extends any = any> {
  items: T[]
  keyFunction: (item: T) => string
  toFunction: (item: T) => string
  childFunction: (item: T) => string
}

function ButtonLinkGroup<T extends any>({
  items,
  keyFunction,
  toFunction,
  childFunction,
}: Props<T>) {
  return (
    <>
      {items.map((item) => (
        <ButtonLink
          to={toFunction(item)}
          key={keyFunction(item)}
          className={clsx('mr-2', 'mb-2')}
          color="info"
        >
          {childFunction(item)}
        </ButtonLink>
      ))}
    </>
  )
}

export default ButtonLinkGroup
