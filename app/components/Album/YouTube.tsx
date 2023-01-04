import clsx from 'clsx'
import React from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'

import { A, Container, Heading } from '~/components/Base'
import useGTM from '~/hooks/useGTM'

interface Props {
  title: string
  url: string
  youtubeID: string
  footer?: React.ReactNode
}

const YouTube: React.FC<Props> = ({ title, url, youtubeID, footer }) => {
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
    </Container>
  )
}

export default YouTube
