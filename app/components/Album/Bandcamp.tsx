import React from 'react'
import clsx from 'clsx'
import type { BandcampDailyAlbum } from '@prisma/client'

import AlbumWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'
import { useDaisyPallete } from '~/hooks/useTailwindTheme'
import type { Tweet } from '~/lib/types/twitter'

interface Props {
  album: Omit<BandcampDailyAlbum, 'createdAt' | 'updatedAt'> | Tweet
  footer?: string | React.ReactNode
}

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'bandcamp-daily',
})

const BandcampAlbum: React.FC<Props> = ({ album, footer }) => {
  const isMobile = useIsMobile()
  const pallete = useDaisyPallete()
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
        footer={
          <>
            {'bandcampDailyURL' in album && (
              <>
                Need convincing? Read the{' '}
                <A
                  href={`${album.bandcampDailyURL}?${searchParams.toString()}`}
                  target="_blank"
                >
                  Bandcamp Daily review
                </A>
                .
              </>
            )}
            {footer}
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
