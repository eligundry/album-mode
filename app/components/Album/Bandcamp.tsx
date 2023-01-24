import type { BandcampDailyAlbum } from '@prisma/client'
import clsx from 'clsx'
import React from 'react'

import { utmParams } from '~/lib/queryParams'
import type { Tweet } from '~/lib/types/twitter'

import { A, Container } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useTailwindTheme from '~/hooks/useTailwindTheme'

import AlbumWrapper from './Wrapper'

interface Props {
  album: Omit<BandcampDailyAlbum, 'createdAt' | 'updatedAt'> | Tweet
  footer?: string | React.ReactNode
}

const searchParams = utmParams({
  campaign: 'publication',
  term: 'bandcamp-daily',
})

const BandcampAlbum: React.FC<Props> = ({ album, footer }) => {
  const isMobile = useIsMobile()
  const { pallete } = useTailwindTheme()
  const params = [
    `album=${album.albumID}`,
    'size=large',
    `bgcol=${pallete['base-100'].replace('#', '')}`,
    `linkcol=${pallete.primary.replace('#', '')}`,
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
            title="Bandcamp embed"
            style={{
              border: 0,
              width: '350px',
              height: isMobile ? '350px' : '470px',
            }}
            src={`https://bandcamp.com/EmbeddedPlayer/${params.join('/')}`}
            seamless
            className={clsx('mx-auto')}
          >
            <a href={`${album.url}?${searchParams.toString()}`}>
              {album.album} by {album.artist}
            </a>
          </iframe>
        }
        title={
          <>
            <A
              href={`${album.url}?${searchParams.toString()}`}
              target="_blank"
              className={clsx(
                'italic',
                'tooltip',
                'tooltip-bottom',
                'text-left'
              )}
              data-tip="▶️ Play on Bandcamp"
            >
              {album.album}
            </A>
            <span className={clsx('text-base')}>{album.artist}</span>
          </>
        }
        footer={footer}
        reviewProps={{
          // @TODO figure out how I want to save bandcamp tweets
          // @ts-ignore
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
