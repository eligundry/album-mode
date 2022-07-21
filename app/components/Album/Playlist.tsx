import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import PlaylistWrapper from './Wrapper'
import { Heading, Container, Typography, A } from '~/components/Base'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  name: string
  description: string | null
  playlistURL: string
}

const linkParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  go: '1',
})

const Playlist: React.FC<Props> = ({ playlistURL, name, description }) => {
  const isMobile = useIsMobile()

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
            {name}
          </A>
        }
        reviewProps={{
          albumURL: playlistURL,
        }}
      />
    </Container>
  )
}

export default Playlist
