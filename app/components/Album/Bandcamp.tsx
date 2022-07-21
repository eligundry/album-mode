import React from 'react'
import clsx from 'clsx'

import AlbumWrapper from './Wrapper'
import { Heading, Container, A } from '~/components/Base'
import ReviewButtons from './ReviewButtons'
import { useIsMobile, useDarkMode } from '~/hooks/useMediaQuery'

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
  const isMobile = useIsMobile()
  const isDarkMode = useDarkMode()
  const params = [
    `album=${albumID}`,
    'size=large',
    `bgcol=${isDarkMode ? '000' : 'fff'}`,
    'linkcol=0687f5',
    'tracklist=false',
    'transparent=true',
  ]

  if (isMobile) {
    params.push('minimal=true')
  }

  return (
    <Container center>
      <AlbumWrapper
        embed={
          <iframe
            style={{
              border: 0,
              width: '350px',
              height: isMobile ? '350px' : '470px',
            }}
            src={`https://bandcamp.com/EmbeddedPlayer/${params.join('/')}`}
            seamless
            className={clsx('mx-auto')}
          >
            <a href={url}>
              {album} by {artist}
            </a>
          </iframe>
        }
        title={
          <>
            <A href={url} target="_blank" className={clsx('italic')}>
              {album}
            </A>{' '}
            by {artist}?
          </>
        }
        footer={footer}
        reviewProps={{ albumURL: `bandcamp/id/${albumID}` }}
      />
    </Container>
  )
}

export default BandcampAlbum
