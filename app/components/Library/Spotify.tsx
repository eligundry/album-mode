import clsx from 'clsx'
import useUpdate from 'react-use/lib/useUpdate'

import Card from '~/components/Base/Card'
import { A, Button, ButtonLink } from '~/components/Base'
import type { SavedSpotifyItem } from '~/lib/types/library'
import useLibrary from '~/hooks/useLibrary'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'library-page',
  go: '1',
})

const SpotifyLibraryCard: React.FC<{ item: SavedSpotifyItem }> = ({ item }) => {
  const url = `${item.external_urls.spotify}?${searchParams.toString()}`
  const { removeItem } = useLibrary()
  const update = useUpdate()

  return (
    <Card
      href={url}
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
            href={`${item.external_urls.spotify}?${searchParams.toString()}`}
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
              href={`${
                item.artists[0].external_urls.spotify
              }?${searchParams.toString()}`}
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
              update()
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
