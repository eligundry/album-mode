import { useMeasure } from '@react-hookz/web'
import clsx from 'clsx'

import { utmParams } from '~/lib/queryParams'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import { useIsMobile } from '~/hooks/useMediaQuery'

import PlaylistWrapper from './Wrapper'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
  footer?: string | React.ReactNode
}

const linkParams = utmParams({
  campaign: 'playlist',
  term: 'spotify-playlist',
  go: '1',
})

const Playlist: React.FC<Props> = ({ playlist, footer }) => {
  const isMobile = useIsMobile()
  const playlistURL = playlist.external_urls.spotify
  const [measures, wrapperRef] = useMeasure()

  return (
    <Container center>
      <PlaylistWrapper
        ref={wrapperRef}
        embed={
          <SpotifyEmbed
            wide={isMobile}
            className={clsx('mx-auto')}
            link={playlistURL}
            height={
              !isMobile && measures?.height
                ? Math.max(measures.height, 380)
                : undefined
            }
          />
        }
        title={
          <A href={`${playlistURL}?${linkParams.toString()}`} target="_blank">
            {playlist.name}
          </A>
        }
        footer={
          <>
            {playlist.description && (
              <p dangerouslySetInnerHTML={{ __html: playlist.description }} />
            )}
            {footer}
          </>
        }
        reviewProps={{
          item: playlist,
        }}
      />
    </Container>
  )
}

export default Playlist
