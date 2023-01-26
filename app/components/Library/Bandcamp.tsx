import clsx from 'clsx'

import type { SavedBandcampItem } from '~/lib/types/library'

import { A, Button, ButtonLink } from '~/components/Base'
import Card from '~/components/Base/Card'
import useLibrary from '~/hooks/useLibrary'
import useUTM from '~/hooks/useUTM'

const BandcampLibraryCard: React.FC<{ item: SavedBandcampItem }> = ({
  item,
}) => {
  const { createExternalURL } = useUTM()
  const url = createExternalURL(item.url).toString()
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
            href={url}
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
