import clsx from 'clsx'

import Card from '~/components/Base/Card'
import { A } from '~/components/Base'
import type { SavedSpotifyItem } from '~/lib/types/library'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'account-page',
  go: '1',
})

const SpotifyLibraryCard: React.FC<{ item: SavedSpotifyItem }> = ({ item }) => (
  <Card
    component="a"
    href={`${item.external_urls.spotify}?${searchParams.toString()}`}
    className={clsx('w-48')}
    target="_blank"
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
  />
)

export default SpotifyLibraryCard
