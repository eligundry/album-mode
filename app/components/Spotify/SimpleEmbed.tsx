import clsx from 'clsx'

import { urlWithUTMParams } from '~/lib/queryParams'

import { A, Container, Heading } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
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
  const titleURL = urlWithUTMParams(url, {
    term: 'reddit',
    go: '1',
  })

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
    </Container>
  )
}

export default SimpleSpotifyEmbed
