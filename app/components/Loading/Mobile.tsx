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
        'btn-square',
        'btn-primary',
        'loading',
        'absolute',
        'bottom-4',
        'right-4',
        'pointer-events-none'
      )}
    />
  )
}

export default MobileLoader
