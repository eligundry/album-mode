import clsx from 'clsx'
import useMeasure from 'react-use/lib/useMeasure'

import SpotifyEmbed from '~/components/Spotify/Embed'
import PlaylistWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
  footer?: string | React.ReactNode
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Playlist: React.FC<Props> = ({ playlist, footer }) => {
  const isMobile = useIsMobile()
  const playlistURL = playlist.external_urls.spotify
  const [wrapperRef, { height }] = useMeasure()

  return (
    <Container center>
      <PlaylistWrapper
        ref={wrapperRef}
        embed={
          <SpotifyEmbed
            wide={isMobile}
            className={clsx('mx-auto')}
            link={playlistURL}
            height={!isMobile ? Math.max(height, 380) : undefined}
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
