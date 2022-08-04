import React from 'react'
import clsx from 'clsx'

import type { WikipediaSummary as Summary } from '~/lib/wikipedia.server'
import { A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  summary: Summary
}

const WikipediaSummary: React.FC<Props> = ({ summary }) => {
  const isMobile = useIsMobile()

  if (!summary || !summary.content_urls) {
    return null
  }

  return (
    <div className={clsx('wikipedia-summary')}>
      <div dangerouslySetInnerHTML={{ __html: summary.extract_html }} />
      <p>
        <A
          href={summary.content_urls[isMobile ? 'mobile' : 'desktop'].page}
          target="_blank"
        >
          Read more on Wikipedia
        </A>
      </p>
    </div>
  )
}

export default WikipediaSummary
