import clsx from 'clsx'

import useLoading from '~/hooks/useLoading'

const MobileLoader: React.FC = () => {
  const { showLoader } = useLoading()

  if (!showLoader) {
    return null
  }

  return (
    <button
      aria-label="Loading indicator"
      style={{ left: '85%' }}
      className={clsx(
        'btn',
        'btn-square',
        'btn-primary',
        'loading',
        'fixed',
        'bottom-4',
        'pointer-events-none'
      )}
    />
  )
}

export default MobileLoader
