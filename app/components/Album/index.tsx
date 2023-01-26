import clsx from 'clsx'
import React from 'react'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import useGTM from '~/hooks/useGTM'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useUTM from '~/hooks/useUTM'

import AlbumWrapper from './Wrapper'

interface NewProps {
  album: SpotifyApi.AlbumObjectSimplified
  footer?: React.ReactNode
}

const Album: React.FC<NewProps> = ({ album, footer }) => {
  const isMobile = useIsMobile()
  const sendEvent = useGTM()
  const { createExternalURL } = useUTM()
  const albumURL = createExternalURL(album.external_urls.spotify).toString()

  return (
    <Container center>
      <AlbumWrapper
        className={clsx('sm:items-stretch')}
        embed={
          <div>
            <SpotifyEmbed
              wide={isMobile}
              className={clsx('mx-auto', 'sm:h-full')}
              link={albumURL}
              style={
                !isMobile
                  ? {
                      maxWidth: '300px',
                      minHeight: '380px',
                    }
                  : undefined
              }
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
                '[&_li:not(:last-child)]:after:text-sm'
              )}
            >
              {album.artists.slice(0, 3).map((artist) => (
                <li key={artist.id}>
                  <A
                    href={createExternalURL(
                      artist.external_urls.spotify
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
        footer={footer}
        reviewProps={{ item: album }}
      />
    </Container>
  )
}
export default Album
