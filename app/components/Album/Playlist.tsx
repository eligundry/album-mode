import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import PlaylistWrapper from './Wrapper'
import { Container, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Playlist: React.FC<Props> = ({ playlist }) => {
  const isMobile = useIsMobile()
  const playlistURL = playlist.external_urls.spotify

  return (
    <Container center>
      <PlaylistWrapper
        embed={
          <SpotifyEmbed
            wide={isMobile}
            className={clsx('mx-auto')}
            link={playlistURL}
          />
        }
        title={
          <A href={`${playlistURL}?${linkParams.toString()}`} target="_blank">
            {playlist.name}
          </A>
        }
        footer={
          playlist.description ? (
            <p dangerouslySetInnerHTML={{ __html: playlist.description }} />
          ) : undefined
        }
        reviewProps={{
          item: playlist,
        }}
      />
    </Container>
  )
}

export default Playlist
