import clsx from 'clsx'

import useSavedSearches from '~/hooks/useSavedSearches'
import { Button } from '~/components/Base'

export interface SearchBreadcrumbsProps {
  crumbs: (string | [string, React.ReactNode])[]
  blurb?: string | null
}

const SearchBreadcrumbs: React.FC<SearchBreadcrumbsProps> = ({
  crumbs,
  blurb,
}) => {
  const { saveSearch, saveable } = useSavedSearches()

  return (
    <>
      <nav className={clsx('flex', 'flex-row', 'justify-end', 'items-center')}>
        <div className={clsx('breadcrumbs', 'capitalize', 'font-bold', 'mr-4')}>
          <ul className={clsx('[&>li>*]:text-truncate')}>
            {crumbs.map((crumb) =>
              typeof crumb === 'string' ? (
                <li key={crumb}>{crumb}</li>
              ) : (
                <li key={crumb[0]}>{crumb[1]}</li>
              )
            )}
          </ul>
        </div>
        <Button
          size="sm"
          onClick={() =>
            saveSearch(
              crumbs.map((crumb) =>
                typeof crumb === 'string' ? crumb : crumb[0]
              )
            )
          }
          disabled={!saveable}
        >
          💾 {saveable ? 'Save Search' : 'Saved'}
        </Button>
      </nav>
      {blurb && <p dangerouslySetInnerHTML={{ __html: blurb }} />}
    </>
  )
}

export default SearchBreadcrumbs
