import clsx from 'clsx'

import { utmParams } from '~/lib/queryParams'
import type { SavedBandcampItem } from '~/lib/types/library'

import { A, Button, ButtonLink } from '~/components/Base'
import Card from '~/components/Base/Card'
import useLibrary from '~/hooks/useLibrary'

const searchParams = utmParams({
  term: 'library-page',
  go: '1',
})

const BandcampLibraryCard: React.FC<{ item: SavedBandcampItem }> = ({
  item,
}) => {
  const url = `${item.url}?${searchParams.toString()}`
  const { removeItem } = useLibrary()

  return (
    <Card
      mediaZoomOnHover
      media={
        item.imageURL ? (
          <img
            src={item.imageURL}
            alt={item.album}
            loading="lazy"
            decoding="async"
          />
        ) : undefined
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
      actionsClassName={clsx('grid', 'grid-cols-2')}
      actions={
        <>
          <ButtonLink href={url} target="_blank" color="info" size="sm">
            Play
          </ButtonLink>
          <Button
            onClick={() => removeItem(item.savedAt)}
            color="danger"
            size="sm"
          >
            Remove
          </Button>
        </>
      }
    />
  )
}

export default BandcampLibraryCard
