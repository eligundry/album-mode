import type {
  Artist,
  Album as FullAlbum,
  SimplifiedAlbum,
} from '@spotify/web-api-ts-sdk'
import clsx from 'clsx'
import React from 'react'

import type { WikipediaSummary as IWikipediaSummary } from '~/lib/wikipedia.server'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import WikipediaSummary from '~/components/WikipediaSummary'
import useGTM from '~/hooks/useGTM'
import useUTM from '~/hooks/useUTM'

import AlbumWrapper from './Wrapper'

interface NewProps {
  album: (SimplifiedAlbum | FullAlbum) & {
    genres?: string[]
    primaryArtist?: Artist
  }
  footer?: React.ReactNode
  wiki?: IWikipediaSummary | null
}

const Album: React.FC<NewProps> = ({ album, footer, wiki }) => {
  const sendEvent = useGTM()
  const { createExternalURL } = useUTM()
  const albumURL = createExternalURL(album.external_urls.spotify).toString()

  return (
    <Container center>
      <AlbumWrapper
        className={clsx(
          'sm:items-stretch',
          '[&_.card-body]:px-0',
          '[&_.card-body]:sm:px-4',
        )}
        embed={
          <div>
            <SpotifyEmbed
              className={clsx(
                'mx-auto',
                'sm:h-full',
                ['w-full', 'sm:w-[300px]'],
                ['sm:min-h-[380px]', 'phone:h-[380px]'],
              )}
              link={albumURL}
            />
          </div>
        }
        title={
          <>
            <A
              href={albumURL}
              target="_blank"
              className={clsx('italic', 'text-left')}
              onClick={() => {
                sendEvent({
                  event: 'Album Opened',
                  albumURL,
                })
              }}
            >
              {album.name}
            </A>
            <ul
              className={clsx(
                'flex',
                'flex-row',
                'flex-wrap',
                'leading-none',
                'gap-x-1',
                "[&_li:not(:last-child)]:after:content-['_•_']",
                '[&_li:not(:last-child)]:after:text-sm',
              )}
            >
              {album.artists.slice(0, 3).map((artist) => (
                <li key={artist.id}>
                  <A
                    href={createExternalURL(
                      artist.external_urls.spotify,
                    ).toString()}
                    target="_blank"
                    className={clsx('text-base')}
                    onClick={() =>
                      sendEvent({
                        event: 'Artist Opened',
                        artistURL: artist.href,
                      })
                    }
                  >
                    {artist.name}
                  </A>
                </li>
              ))}
            </ul>
          </>
        }
        footer={
          <>
            {footer}
            {wiki && <WikipediaSummary summary={wiki} />}
          </>
        }
        genres={album.genres}
        popularity={album.primaryArtist?.popularity}
        reviewProps={{
          item: {
            service: 'spotify',
            name: album.name,
            creator: album.artists[0].name,
            url: album.external_urls.spotify,
            creatorURL: album.artists[0].external_urls.spotify,
            image: album.images[0],
          },
        }}
        releaseDate={album.release_date}
      />
    </Container>
  )
}
export default Album
