import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading } from '~/components/Base'

interface Props {
  url: string
  artist: string
  album: string
  footer?: React.ReactNode
}

const Album: React.FC<Props> = ({ url, artist, album, footer }) => {
  return (
    <>
      <Heading level="h2" className={clsx('mb-4')}>
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <SpotifyEmbed link={url} />
      {footer}
    </>
  )
}

export default Album
