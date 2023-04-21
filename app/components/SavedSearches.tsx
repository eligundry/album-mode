import clsx from 'clsx'

import type { ButtonProps } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import useLoading from '~/hooks/useLoading'
import useSavedSearches from '~/hooks/useSavedSearches'

interface Props {
  limit?: number
  size?: ButtonProps['size']
}

const SavedSearches: React.FC<Props> = ({ limit }) => {
  const { searches } = useSavedSearches()
  const { loading } = useLoading()

  return (
    <ButtonLinkGroup
      className={clsx('breadcrumbs')}
      items={searches.slice(0, limit)}
      toFunction={({ path }) => path}
      keyFunction={({ path }) => path}
      childFunction={({ crumbs }) => (
        <ul>
          {crumbs.map((crumb) => (
            <li key={crumb}>{crumb}</li>
          ))}
        </ul>
      )}
      disabled={loading}
    />
  )
}

export default SavedSearches
