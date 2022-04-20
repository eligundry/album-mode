import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading, Container } from '~/components/Base'
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
      <Heading level="h2" className={clsx('mb-4')}>
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <SpotifyEmbed className={clsx('mx-auto')} link={url} />
      {footer}
      <ReviewButtons albumURL={url} />
    </Container>
  )
}

export default Album
