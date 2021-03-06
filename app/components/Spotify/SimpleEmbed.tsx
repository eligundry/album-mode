import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import { Heading, Container, A } from '~/components/Base'
import ReviewButtons from '~/components/Album/ReviewButtons'
import useGTM from '~/hooks/useGTM'
import { useIsMobile } from '~/hooks/useMediaQuery'

interface Props {
  title: string
  url: string
  footer?: React.ReactNode
  headerPrefix?: string
}

const SimpleSpotifyEmbed: React.FC<Props> = ({
  title,
  url,
  footer,
  headerPrefix = 'Have you heard',
}) => {
  const sendEvent = useGTM()
  const isMobile = useIsMobile()

  // Clean up the URL so it can launch in the native player
  const titleURL = new URL(url)
  titleURL.search = new URLSearchParams({
    go: '1',
    utm_campaign: 'album-mode.party',
    utm_term: 'reddit',
  }).toString()

  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-2', 'sm:mt-0')}>
        {headerPrefix + ' '}
        <em>
          <A
            href={titleURL.toString()}
            target="_blank"
            onClick={() => {
              sendEvent({
                event: 'Album Opened',
                albumURL: url,
              })
            }}
          >
            {title}
          </A>
        </em>
        ?
      </Heading>
      <SpotifyEmbed wide={isMobile} className={clsx('mx-auto')} link={url} />
      {footer}
      <ReviewButtons
        albumURL={url}
        albumName={title}
        artistName={title}
        containerClassName={clsx(!footer && 'mt-4')}
      />
    </Container>
  )
}

export default SimpleSpotifyEmbed
