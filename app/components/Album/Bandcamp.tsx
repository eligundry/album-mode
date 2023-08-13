import clsx from 'clsx'
import React from 'react'

import type { WikipediaSummary as IWikipediaSummary } from '~/lib/wikipedia.server'

import { A, Container } from '~/components/Base'
import WikipediaSummary from '~/components/WikipediaSummary'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useTailwindTheme from '~/hooks/useTailwindTheme'
import useUTM from '~/hooks/useUTM'

import AlbumWrapper from './Wrapper'

interface Props {
  album: {
    album: string
    albumID: string
    artist: string
    imageURL: string | null
    url: string
  }
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

  return (
    <Container center>
      <AlbumWrapper
        className={clsx(
          'sm:items-stretch',
          '[&_.card-body]:px-0',
          '[&_.card-body]:sm:px-4',
        )}
        embed={
          <iframe
            title="Bandcamp embed"
            src={`https://bandcamp.com/EmbeddedPlayer/${params.join('/')}`}
            seamless
            className={clsx(
              'mx-auto',
              'border-none',
              ['w-full', 'h-[390px]'],
              ['sm:w-[350px]', 'sm:h-[470px]'],
            )}
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
            service: 'bandcamp',
            name: album.album,
            creator: album.artist,
            url: album.url,
            image: album.imageURL ? { url: album.imageURL } : null,
          },
        }}
      />
    </Container>
  )
}

export default BandcampAlbum
