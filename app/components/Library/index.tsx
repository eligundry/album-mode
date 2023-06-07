import clsx from 'clsx'

import type { LibraryItem } from '~/lib/types/library'

import { A, Button, ButtonLink, Typography } from '~/components/Base'
import Card from '~/components/Base/Card'
import useLibrary from '~/hooks/useLibrary'
import useUTM from '~/hooks/useUTM'

const LibraryCard: React.FC<{ item: LibraryItem }> = ({ item }) => {
  const { createExternalURL } = useUTM()
  const url = createExternalURL(item.url).toString()
  const { removeItem } = useLibrary()

  return (
    <Card
      mediaZoomOnHover
      media={
        item.image ? (
          <img
            src={item.image.url}
            width={item.image.width}
            height={item.image.height}
            alt={item.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className={clsx('text-center', 'my-auto', 'text-8xl', 'my-[30%]')}
          >
            💿🎉
          </div>
        )
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
            {item.name}
          </A>
          {item.creatorURL ? (
            <A
              className={clsx(
                'text-base',
                'leading-none',
                'text-ellipsis',
                'block',
                'nowrap',
                'overflow-hidden'
              )}
              href={createExternalURL(item.creatorURL).toString()}
              target="_blank"
            >
              {item.creator}
            </A>
          ) : (
            <Typography
              className={clsx(
                'text-base',
                'leading-none',
                'text-ellipsis',
                'block',
                'nowrap',
                'overflow-hidden'
              )}
            >
              {item.creator}
            </Typography>
          )}
        </>
      }
      actionsClassName={clsx('grid', 'grid-cols-2')}
      actions={
        <>
          <ButtonLink href={url} target="_blank" color="info" size="sm">
            Play
          </ButtonLink>
          <Button
            onClick={() => {
              removeItem(item)
            }}
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

const Library: React.FC = () => {
  const { library } = useLibrary()

  return (
    <section className={clsx('grid', 'grid-cols-2', 'sm:grid-cols-4', 'gap-4')}>
      {library.map((item) => (
        <LibraryCard item={item} key={item.savedAt.toISOString()} />
      ))}
    </section>
  )
}

export default Library
