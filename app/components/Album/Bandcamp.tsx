import type { BandcampDailyAlbum } from '@prisma/client'
import clsx from 'clsx'
import React from 'react'

import type { Tweet } from '~/lib/types/twitter'
import type { WikipediaSummary as IWikipediaSummary } from '~/lib/wikipedia.server'

import { A, Container } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useTailwindTheme from '~/hooks/useTailwindTheme'
import useUTM from '~/hooks/useUTM'

import AlbumWrapper from './Wrapper'

interface Props {
  albumID: string
  albumURL: string
  album: string
  artist: string
  footer?: string | React.ReactNode
  wiki?: IWikipediaSummary | null
}

const BandcampAlbum: React.FC<Props> = ({
  albumID,
  albumURL,
  album,
  artist,
  footer,
  wiki,
}) => {
  const isMobile = useIsMobile()
  const { pallete } = useTailwindTheme()
  const { createExternalURL } = useUTM()
  const params = [
    `album=${albumID}`,
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
            <a href={createExternalURL(albumURL).toString()}>
              {album} by {artist}
            </a>
          </iframe>
        }
        title={
          <>
            <A
              href={createExternalURL(albumURL).toString()}
              target="_blank"
              className={clsx('italic', 'text-left')}
              data-tip="▶️ Play on Bandcamp"
            >
              {album}
            </A>
            <span className={clsx('text-base')}>{artist}</span>
          </>
        }
        footer={footer}
        reviewProps={{
          // @TODO figure out how I want to save bandcamp tweets
          // @ts-ignore
          item: {
            // ...review,
            url: albumURL,
            type: 'bandcamp',
          },
        }}
      />
    </Container>
  )
}

export default BandcampAlbum
