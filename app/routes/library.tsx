import clsx from 'clsx'
import { Layout, Typography, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import LibraryCard from '~/components/Library'
import useAlbumLibrary from '~/hooks/useLibrary'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
})

export default function LibraryPage() {
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
            <LibraryCard item={item} key={item.savedAt.toISOString()} />
          ))}
        </section>
      </Container>
    </Layout>
  )
}
