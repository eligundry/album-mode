import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading, Container, Typography, A } from '~/components/Base'
import ReviewButtons from './ReviewButtons'
import useIsMobile from '~/hooks/useIsMobile'
import useGTM from '~/hooks/useGTM'

interface Props {
  album: string
  albumURL: string
  artist: string
  artistURL: string
  footer?: React.ReactNode
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
}) => {
  const isMobile = useIsMobile()
  const sendEvent = useGTM()

  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-2', 'sm:mt-0')}>
        Have you heard{' '}
        <em>
          <A
            href={`${albumURL}?${linkParams.toString()}`}
            target="_blank"
            onClick={() => {
              sendEvent({
                event: 'Spotify Album Opened',
                albumURL,
              })
            }}
          >
            {album}
          </A>
        </em>{' '}
        by{' '}
        <A
          href={`${artistURL}?${linkParams.toString()}`}
          target="_blank"
          onClick={() =>
            sendEvent({
              event: 'Spotify Artist Opened',
              artistURL,
            })
          }
        >
          {artist}
        </A>
        ?
      </Heading>
      <Typography variant="hint" className={clsx('mb-2')}>
        Click on the Spotify icon in the top right corner to open this in the
        native player
      </Typography>
      <SpotifyEmbed
        wide={isMobile}
        className={clsx('mx-auto')}
        link={albumURL}
      />
      {footer}
      <ReviewButtons
        albumURL={albumURL}
        containerClassName={clsx(!footer && 'mt-4')}
      />
    </Container>
  )
}

export default Album
