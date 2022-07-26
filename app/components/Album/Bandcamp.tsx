import React from 'react'
import clsx from 'clsx'

import AlbumWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile, useDarkMode } from '~/hooks/useMediaQuery'
import type { BandcampDailyAlbum } from '@prisma/client'

interface Props {
  album: BandcampDailyAlbum
}

const BandcampAlbum: React.FC<Props> = ({ album }) => {
  const isMobile = useIsMobile()
  const isDarkMode = useDarkMode()
  const params = [
    `album=${album.albumID}`,
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
            <a href={album.url}>
              {album.album} by {album.artist}
            </a>
          </iframe>
        }
        title={
          <>
            <A href={album.url} target="_blank" className={clsx('italic')}>
              {album.album}
            </A>
            <span className={clsx('text-base')}>{album.artist}</span>
          </>
        }
        footer={
          <>
            Need convincing? Read the{' '}
            <A href={album.bandcampDailyURL} target="_blank">
              Bandcamp Daily review
            </A>
            .
          </>
        }
        reviewProps={{
          item: {
            ...album,
            type: 'bandcamp',
          },
        }}
      />
    </Container>
  )
}

export default BandcampAlbum
