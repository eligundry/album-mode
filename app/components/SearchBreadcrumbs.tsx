import clsx from 'clsx'

import useSavedSearches from '~/hooks/useSavedSearches'
import { Link, Container, Button } from '~/components/Base'

interface Props {
  parts: string[]
  blurb?: string | null
}

const SearchBreadcrumbs: React.FC<Props> = ({ parts, blurb }) => {
  const { saveSearch, saveable } = useSavedSearches()

  return (
    <Container className={clsx('mb-4')}>
      <nav className={clsx('flex', 'flex-row', 'justify-between')}>
        <div className={clsx('breadcrumbs', 'uppercase')}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {parts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        {saveable && (
          <Button size="sm" onClick={() => saveSearch(parts)}>
            💾 Save Search
          </Button>
        )}
      </nav>
      {blurb && <p dangerouslySetInnerHTML={{ __html: blurb }} />}
    </Container>
  )
}

export default SearchBreadcrumbs
