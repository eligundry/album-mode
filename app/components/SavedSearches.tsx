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
      items={Object.entries(searches).slice(0, limit)}
      toFunction={([path]) => path}
      keyFunction={([path]) => path}
      childFunction={([, parts]) => (
        <ul>
          {parts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    />
  )
}

export default SavedSearches
