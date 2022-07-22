import clsx from 'clsx'
import { Layout, Typography, A, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import Card from '~/components/Base/Card'
import useAlbumLibrary from '~/hooks/useLibrary'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
})

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
          Library
        </Heading>
        <Typography variant="hint" className={clsx('mb-4')}>
          These items are saved to your browser's local storage.
        </Typography>
        <section className={clsx('flex', 'flex-wrap', 'flex-row', 'gap-4')}>
          {library?.items.reverse().map((item) => (
            <Card
              component="a"
              href={`${item.external_urls.spotify}?${searchParams.toString()}`}
              className={clsx('w-48')}
              target="_blank"
              media={
                <img
                  src={item.images[0].url}
                  width={item.images[0].width}
                  height={item.images[0].height}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                />
              }
              title={item.name}
            />
          ))}
        </section>
      </Container>
    </Layout>
  )
}
