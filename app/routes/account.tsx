import clsx from 'clsx'
import { Layout, Typography, A, Heading, Container } from '~/components/Base'
import useAlbumLibrary from '~/hooks/useAlbumLibrary'

const searchParams = new URLSearchParams({
  utm_campaign: 'album-mode.party',
  utm_term: 'account-page',
  go: '1',
})

export default function AccountPage() {
  const { library } = useAlbumLibrary()

  return (
    <Layout>
      <Container>
        <Heading level="h2" className={clsx('mb-0')}>
          Liked Albums
        </Heading>
        <Typography variant="hint" className={clsx('mb-4')}>
          These albums are saved to your browser's local storage.
        </Typography>
        {!library ? (
          <Typography>You don't have any albums saved.</Typography>
        ) : (
          <ul>
            {library.reverse().map((album) => (
              <li key={album.savedAt.toISOString()}>
                <A
                  href={`${album.albumURL}?${searchParams.toString()}`}
                  target="_blank"
                >
                  <em>{album.name}</em> - {album.artist}
                </A>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Layout>
  )
}
