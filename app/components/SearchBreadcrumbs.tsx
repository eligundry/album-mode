import clsx from 'clsx'

import useSavedSearches from '~/hooks/useSavedSearches'
import { useIsMobile } from '~/hooks/useMediaQuery'
import { Button } from '~/components/Base'

export interface SearchBreadcrumbsProps {
  crumbs: (string | [string, React.ReactNode])[]
  className?: string
}

const SearchBreadcrumbs: React.FC<SearchBreadcrumbsProps> = ({
  crumbs,
  className,
}) => {
  const isMobile = useIsMobile()
  const { saveSearch, saveable } = useSavedSearches()

  return (
    <nav
      className={clsx(
        'flex',
        'flex-row',
        // 'justify-end',
        'items-center',
        className
      )}
    >
      <div
        className={clsx(
          'breadcrumbs',
          'capitalize',
          'font-bold',
          'mr-4',
          'overflow-hidden'
        )}
      >
        <ul className={clsx('[&>li>*]:text-truncate')}>
          {crumbs
            .slice(isMobile ? crumbs.length - 1 : 0)
            .map((crumb) =>
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
  )
}

export default SearchBreadcrumbs
