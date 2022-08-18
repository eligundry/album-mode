import clsx from 'clsx'
import { Portal } from 'react-portal'

interface Props {
  name: string
  closeable?: boolean
  className?: string
}

const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  name,
  closeable,
  className,
}) => {
  return (
    <Portal>
      <input type="checkbox" id={name} className={clsx('modal-toggle')} />
      <div className={clsx('modal')}>
        <div className={clsx('modal-box', closeable && 'relative', className)}>
          {closeable && (
            <label
              htmlFor={name}
              className={clsx(
                'btn',
                'btn-sm',
                'btn-circle',
                'absolute',
                'right-2',
                'top-2'
              )}
            >
              ✕
            </label>
          )}
          {children}
        </div>
      </div>
    </Portal>
  )
}

export default Modal
