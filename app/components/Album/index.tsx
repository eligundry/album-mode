import clsx from 'clsx'
import React from 'react'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import useGTM from '~/hooks/useGTM'
import { useIsMobile } from '~/hooks/useMediaQuery'

import AlbumWrapper from './Wrapper'

interface NewProps {
  album: SpotifyApi.AlbumObjectSimplified
  footer?: React.ReactNode
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Album: React.FC<NewProps> = ({ album, footer }) => {
  const isMobile = useIsMobile()
  const sendEvent = useGTM()
  const albumURL = album.external_urls.spotify
  const artistURL = album.artists[0].external_urls.spotify
  const artist = album.artists[0].name

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
              href={`${albumURL}?${linkParams.toString()}`}
              target="_blank"
              className={clsx(
                'italic',
                'tooltip',
                'tooltip-bottom',
                'text-left'
              )}
              data-tip="▶️ Play on Spotify"
              onClick={() => {
                sendEvent({
                  event: 'Album Opened',
                  albumURL,
                })
              }}
            >
              {album.name}
            </A>
            <A
              className={clsx('text-base', 'tooltip', 'tooltip-bottom')}
              href={`${artistURL}?${linkParams.toString()}`}
              target="_blank"
              data-tip="View artist on Spotify"
              onClick={() =>
                sendEvent({
                  event: 'Artist Opened',
                  artistURL,
                })
              }
            >
              {artist}
            </A>
          </>
        }
        footer={footer}
        reviewProps={{ item: album }}
      />
    </Container>
  )
}
export default Album
