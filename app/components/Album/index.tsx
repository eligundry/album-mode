import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'

import { Heading } from '~/components/Base'

interface Props {
  url: string
  artist: string
  album: string
}

const Album: React.FC<Props> = ({ url, artist, album }) => {
  return (
    <>
      <Heading level="h2">
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <SpotifyEmbed link={url} />
    </>
  )
}

export default Album
