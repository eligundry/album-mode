import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

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
      <Heading level="h2" className={clsx('mb-2', 'sm:mt-0')}>
        Are you in the mood for{' '}
        <em>
          <A href={`${playlistURL}?${linkParams.toString()}`} target="_blank">
            {name}
          </A>
        </em>
        ?
      </Heading>
      <SpotifyEmbed
        wide={isMobile}
        className={clsx('mx-auto')}
        link={playlistURL}
      />
    </Container>
  )
}

export default Playlist
