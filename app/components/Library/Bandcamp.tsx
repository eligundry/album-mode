import clsx from 'clsx'

import Card from '~/components/Base/Card'
import { A, Button, ButtonLink } from '~/components/Base'
import type { SavedBandcampItem } from '~/lib/types/library'
import useLibrary from '~/hooks/useLibrary'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'library-page',
  go: '1',
})

const BandcampLibraryCard: React.FC<{ item: SavedBandcampItem }> = ({
  item,
}) => {
  const url = `${item.url}?${searchParams.toString()}`
  const { removeItem } = useLibrary()

  return (
    <Card
      href={url}
      className={clsx('w-44')}
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
