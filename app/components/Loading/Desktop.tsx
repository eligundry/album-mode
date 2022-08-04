import clsx from 'clsx'

import useLoading from '~/hooks/useLoading'

const DesktopLoader: React.FC = () => {
  const { showLoader } = useLoading()

  return (
    <progress
      value={showLoader ? undefined : 0}
      max={showLoader ? undefined : 100}
      className={clsx(
        'progress',
        'progress-primary',
        'align-top',
        'rounded-none',
        'bg-transparent',
        '[&::-webkit-progress-bar]:bg-transparent',
        showLoader && ['sticky', 'top-0']
      )}
    />
  )
}

export default DesktopLoader
