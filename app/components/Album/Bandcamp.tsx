import clsx from 'clsx'
import React from 'react'

import type { BandcampAlbum as IBandcampAlbum } from '~/lib/types/library'
import type { WikipediaSummary as IWikipediaSummary } from '~/lib/wikipedia.server'

import { A, Container } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useTailwindTheme from '~/hooks/useTailwindTheme'
import useUTM from '~/hooks/useUTM'

import AlbumWrapper from './Wrapper'

interface Props {
  album: IBandcampAlbum
  footer?: string | React.ReactNode
  wiki?: IWikipediaSummary | null
}

const BandcampAlbum: React.FC<Props> = ({ album, footer, wiki }) => {
  const isMobile = useIsMobile()
  const { pallete } = useTailwindTheme()
  const { createExternalURL } = useUTM()
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

  console.log({ album })

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
            <a href={createExternalURL(album.url).toString()}>
              {album.album} by {album.artist}
            </a>
          </iframe>
        }
        title={
          <>
            <A
              href={createExternalURL(album.url).toString()}
              target="_blank"
              className={clsx('italic', 'text-left')}
              data-tip="▶️ Play on Bandcamp"
            >
              {album.album}
            </A>
            <span className={clsx('text-base')}>{album.artist}</span>
          </>
        }
        footer={
          <>
            {footer}
            {wiki && <WikipediaSummary summary={wiki} />}
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
