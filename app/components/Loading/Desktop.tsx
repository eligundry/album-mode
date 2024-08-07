import clsx from 'clsx'
import { useEffect, useState } from 'react'

import useLoading from '~/hooks/useLoading'

const DesktopLoader: React.FC = () => {
  const { showLoader } = useLoading()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const callback: Parameters<typeof window.addEventListener<'scroll'>>[1] =
      function () {
        setScrolled(this.scrollY > 40)
      }

    window.addEventListener('scroll', callback)

    return () => window.removeEventListener('scroll', callback)
  }, [])

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
        showLoader && [scrolled ? 'fixed' : 'sticky', 'top-0'],
        'phone:hidden',
      )}
    />
  )
}

export default DesktopLoader
