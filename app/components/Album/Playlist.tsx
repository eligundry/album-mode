import { useMeasure } from '@react-hookz/web'
import clsx from 'clsx'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useUTM from '~/hooks/useUTM'

import PlaylistWrapper from './Wrapper'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
  footer?: string | React.ReactNode
}

const Playlist: React.FC<Props> = ({ playlist, footer }) => {
  const isMobile = useIsMobile()
  const { createExternalURL } = useUTM()
  const playlistURL = createExternalURL(
    playlist.external_urls.spotify
  ).toString()
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
          <A href={playlistURL} target="_blank">
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
