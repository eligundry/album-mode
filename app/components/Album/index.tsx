import React from 'react'
import SpotifyEmbed from 'react-spotify-embed'
import clsx from 'clsx'

import {
  Heading,
  ButtonGroup,
  ButtonLink,
  Button,
  Container,
} from '~/components/Base'
import useRating from '~/hooks/useRating'
import useWindow from '~/hooks/useWindow'

interface Props {
  url: string
  artist: string
  album: string
  footer?: React.ReactNode
}

const Album: React.FC<Props> = ({ url, artist, album, footer }) => {
  const window = useWindow()
  const { positiveReview, negativeReview } = useRating()

  return (
    <Container center>
      <Heading level="h2" className={clsx('mb-4')}>
        Have you heard <em>{album}</em> by {artist}?
      </Heading>
      <SpotifyEmbed className={clsx('mx-auto')} link={url} />
      {footer}
      <ButtonGroup className={clsx('mt-4')}>
        <Button
          color="info"
          onClick={() => positiveReview(url)}
          className={clsx('mr-2', 'sm:mb-2')}
        >
          🙌 &nbsp; Great selection, I love it!
        </Button>
        <ButtonLink
          to={window?.location.pathname ?? '/'}
          onClick={() => negativeReview(url)}
          color="danger"
          className={clsx('inline-block')}
        >
          👎 &nbsp; Not interested, give me another
        </ButtonLink>
      </ButtonGroup>
    </Container>
  )
}

export default Album
