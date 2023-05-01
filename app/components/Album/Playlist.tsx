import clsx from 'clsx'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import { useIsMobile } from '~/hooks/useMediaQuery'
import useUTM from '~/hooks/useUTM'

import PlaylistWrapper from './Wrapper'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
  footer?: string | React.ReactNode
  forceTall?: boolean
}

const Playlist: React.FC<Props> = ({ playlist, footer, forceTall = false }) => {
  const isMobile = useIsMobile()
  const { createExternalURL } = useUTM()
  const playlistURL = createExternalURL(
    playlist.external_urls.spotify
  ).toString()
  const isWide = !forceTall && isMobile

  return (
    <Container center>
      <PlaylistWrapper
        className={clsx(
          'sm:items-stretch',
          '[&_.card-body]:px-0',
          '[&_.card-body]:sm:px-4'
        )}
        embed={
          <div>
            <SpotifyEmbed
              className={clsx(
                'mx-auto',
                'sm:h-full',
                ['w-full', 'sm:w-[300px]'],
                [isWide ? 'max-h-[80px]' : 'min-h-[380px]', 'sm:min-h-full']
              )}
              link={playlistURL}
            />
          </div>
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
