import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading, Container, Typography } from '~/components/Base'
import ReviewButtons from './ReviewButtons'

interface Props {
  url: string
  artist: string
  album: string
  footer?: React.ReactNode
}

const Album: React.FC<Props> = ({ url, artist, album, footer }) => {
  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-2', 'sm:mt-0')}>
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <Typography variant="hint" className={clsx('mb-2')}>
        Click on the Spotify icon in the top right corner to open this in the
        native player
      </Typography>
      <SpotifyEmbed className={clsx('mx-auto')} link={url} />
      {footer}
      <ReviewButtons
        albumURL={url}
        containerClassName={clsx(!footer && 'mt-4')}
      />
    </Container>
  )
}

export default Album
