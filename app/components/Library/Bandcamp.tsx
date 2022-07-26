import clsx from 'clsx'

import Card from '~/components/Base/Card'
import { A } from '~/components/Base'
import type { SavedBandcampItem } from '~/lib/types/library'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'account-page',
  go: '1',
})

const BandcampLibraryCard: React.FC<{ item: SavedBandcampItem }> = ({
  item,
}) => (
  <Card
    component="a"
    href={`${item.url}?${searchParams.toString()}`}
    className={clsx('w-44')}
    target="_blank"
    mediaZoomOnHover
    media={
      <img
        src={item.imageURL}
        alt={item.album}
        loading="lazy"
        decoding="async"
      />
    }
    title={
      <>
        <A
          className={clsx(
            'text-lg',
            'leading-none',
            'text-ellipsis',
            'block',
            'nowrap',
            'overflow-hidden'
          )}
          href={`${item.url}?${searchParams.toString()}`}
          target="_blank"
        >
          {item.album}
        </A>
        <span
          className={clsx(
            'text-base',
            'leading-none',
            'text-ellipsis',
            'block',
            'nowrap',
            'overflow-hidden'
          )}
        >
          {item.artist}
        </span>
      </>
    }
  />
)

export default BandcampLibraryCard
