import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import AlbumWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useGTM from '~/hooks/useGTM'

interface Props {
  album: string
  albumURL: string
  artist: string
  artistURL: string
  footer?: React.ReactNode
  headerPrefix?: string
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Album: React.FC<Props> = ({
  albumURL,
  artist,
  artistURL,
  album,
  footer,
  headerPrefix = 'Have you heard',
}) => {
  const isMobile = useIsMobile()
  const sendEvent = useGTM()

  return (
    <Container center>
      <AlbumWrapper
        embed={
          <SpotifyEmbed
            wide={isMobile}
            className={clsx('mx-auto')}
            link={albumURL}
          />
        }
        title={
          <>
            <A
              href={`${albumURL}?${linkParams.toString()}`}
              target="_blank"
              className={clsx('italic')}
              onClick={() => {
                sendEvent({
                  event: 'Album Opened',
                  albumURL,
                })
              }}
            >
              {album}
            </A>{' '}
            by{' '}
            <A
              href={`${artistURL}?${linkParams.toString()}`}
              target="_blank"
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
        reviewProps={{
          albumURL,
          artistName: artist,
          albumName: album,
        }}
      />
    </Container>
  )
}
export default Album
