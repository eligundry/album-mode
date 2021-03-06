import clsx from 'clsx'

import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import useSavedSearches from '~/hooks/useSavedSearches'

interface Props {
  limit?: number
}

const SavedSearches: React.FC<Props> = ({ limit }) => {
  const { searches } = useSavedSearches()

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
    />
  )
}

export default SavedSearches
