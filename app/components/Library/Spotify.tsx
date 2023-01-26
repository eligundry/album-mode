import clsx from 'clsx'

import type { SavedSpotifyItem } from '~/lib/types/library'

import { A, Button, ButtonLink } from '~/components/Base'
import Card from '~/components/Base/Card'
import useLibrary from '~/hooks/useLibrary'
import useUTM from '~/hooks/useUTM'

const SpotifyLibraryCard: React.FC<{ item: SavedSpotifyItem }> = ({ item }) => {
  const { createExternalURL } = useUTM()
  const url = createExternalURL(item.external_urls.spotify).toString()
  const { removeItem } = useLibrary()

  return (
    <Card
      mediaZoomOnHover
      media={
        <img
          src={item.images[0].url}
          width={item.images[0].width}
          height={item.images[0].height}
          alt={item.name}
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
            href={url}
            target="_blank"
          >
            {item.name}
          </A>
          {item.type === 'album' && (
            <A
              className={clsx(
                'text-base',
                'leading-none',
                'text-ellipsis',
                'block',
                'nowrap',
                'overflow-hidden'
              )}
              href={createExternalURL(
                item.artists[0].external_urls.spotify
              ).toString()}
              target="_blank"
            >
              {item.artists[0].name}
            </A>
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
              removeItem(item.savedAt)
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

export default SpotifyLibraryCard
