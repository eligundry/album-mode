import clsx from 'clsx'

import { A, Container } from '~/components/Base'
import SpotifyEmbed from '~/components/Spotify/Embed'
import useUTM from '~/hooks/useUTM'

import PlaylistWrapper from './Wrapper'

interface Props {
  playlist: SpotifyApi.PlaylistObjectSimplified | SpotifyApi.PlaylistObjectFull
  footer?: string | React.ReactNode
}

const Playlist: React.FC<Props> = ({ playlist, footer }) => {
  const { createExternalURL } = useUTM()
  const playlistURL = createExternalURL(
    playlist.external_urls.spotify,
  ).toString()

  return (
    <Container center>
      <PlaylistWrapper
        className={clsx(
          'sm:items-stretch',
          '[&_.card-body]:px-0',
          '[&_.card-body]:sm:px-4',
        )}
        embed={
          <div>
            <SpotifyEmbed
              className={clsx(
                'mx-auto',
                'sm:h-full',
                ['w-full', 'sm:w-[300px]'],
                ['sm:min-h-[380px]', 'phone:h-[380px]'],
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
          item: {
            service: 'spotify',
            name: playlist.name,
            creator: playlist.owner.display_name,
            url: playlist.external_urls.spotify,
            creatorURL: playlist.owner.external_urls.spotify,
            image: playlist.images[0],
          },
        }}
      />
    </Container>
  )
}

export default Playlist
