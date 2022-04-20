import React from 'react'
import clsx from 'clsx'

import { Heading, Container } from '~/components/Base'
import ReviewButtons from './ReviewButtons'

interface Props {
  albumID: string | number
  artist: string
  album: string
  url: string
  footer?: React.ReactNode
}

const BandcampAlbum: React.FC<Props> = ({
  albumID,
  artist,
  album,
  url,
  footer,
}) => {
  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-4')}>
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <iframe
        style={{ border: 0, width: '350px', height: '470px' }}
        src={`https://bandcamp.com/EmbeddedPlayer/album=${albumID}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`}
        seamless
        className={clsx('mx-auto')}
      >
        <a href={url}>
          {album} by {artist}
        </a>
      </iframe>
      {footer}
      <ReviewButtons albumURL={`bandcamp/id/${albumID}`} />
    </Container>
  )
}

export default BandcampAlbum
