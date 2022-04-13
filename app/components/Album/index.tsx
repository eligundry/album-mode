import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading, ButtonGroup, Button, Container } from '~/components/Base'

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
      <ButtonGroup className={clsx('mt-4')}>
        <Button
          onClick={() => window.location.reload()}
          color="danger"
          className="reload-btn"
        >
          Already heard this, give me another
        </Button>
      </ButtonGroup>
    </Container>
  )
}

export default Album
