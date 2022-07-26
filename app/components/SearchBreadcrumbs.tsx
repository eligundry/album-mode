import clsx from 'clsx'

import useSavedSearches from '~/hooks/useSavedSearches'
import { Container, Button } from '~/components/Base'

interface Props {
  crumbs: (string | [string, React.ReactNode])[]
  blurb?: string | null
}

const SearchBreadcrumbs: React.FC<Props> = ({ crumbs, blurb }) => {
  const { saveSearch, saveable } = useSavedSearches()

  return (
    <Container className={clsx('mb-4')}>
      <nav className={clsx('flex', 'flex-row', 'justify-end', 'items-center')}>
        <div className={clsx('breadcrumbs', 'uppercase', 'mr-4')}>
          <ul>
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
    </Container>
  )
}

export default SearchBreadcrumbs
