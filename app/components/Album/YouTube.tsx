import React from 'react'
import clsx from 'clsx'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'

import { Heading, Container, A } from '~/components/Base'
import ReviewButtons from '~/components/Album/ReviewButtons'
import useGTM from '~/hooks/useGTM'

interface Props {
  title: string
  url: string
  youtubeID: string
  footer?: React.ReactNode
}

const YouTube: React.FC<Props> = ({
  title,
  url,
  redditURL,
  youtubeID,
  footer,
}) => {
  const sendEvent = useGTM()

  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-4')}>
        Have you heard{' '}
        <em>
          <A
            href={url}
            target="_blank"
            onClick={() =>
              sendEvent({
                event: 'Album Opened',
                albumURL: url,
              })
            }
          >
            {title}
          </A>
        </em>
        ?
      </Heading>
      <LiteYouTubeEmbed id={youtubeID} title={title} />
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

export default YouTube
