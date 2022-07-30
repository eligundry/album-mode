import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'
import useMeasure from 'react-use/lib/useMeasure'

import AlbumWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useGTM from '~/hooks/useGTM'

interface NewProps {
  album: SpotifyApi.AlbumObjectSimplified
  footer?: React.ReactNode
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Album: React.FC<NewProps> = ({ album, footer }) => {
  const [wrapperRef, { height }] = useMeasure()
  const isMobile = useIsMobile()
  const sendEvent = useGTM()
  const albumURL = album.external_urls.spotify
  const artistURL = album.artists[0].external_urls.spotify
  const artist = album.artists[0].name

  return (
    <Container center>
      <AlbumWrapper
        ref={wrapperRef}
        embed={
          <SpotifyEmbed
            wide={isMobile}
            className={clsx('mx-auto')}
            link={albumURL}
            height={!isMobile ? Math.max(height, 380) : undefined}
          />
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
