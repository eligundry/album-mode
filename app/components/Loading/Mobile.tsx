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
      className={clsx(
        'btn',
        'btn-primary',
        'btn-square',
        'btn-primary',
        'fixed',
        'bottom-4',
        'pointer-events-none',
        'left-[85%]',
      )}
    >
      <span className="loading loading-spinner" />
    </button>
  )
}

export default MobileLoader
