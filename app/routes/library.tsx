import clsx from 'clsx'
import { Layout, Typography, Heading, Container } from '~/components/Base'
import type { MetaFunction } from '@remix-run/node'

import LibraryCard from '~/components/Library'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import useAlbumLibrary from '~/hooks/useLibrary'
import useSavedSearches from '~/hooks/useSavedSearches'

export const meta: MetaFunction = () => ({
  title: 'Library | Album Mode.party 🎉',
})

export default function LibraryPage() {
  const { library } = useAlbumLibrary()
  const { searches } = useSavedSearches()

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
        {searches && (
          <>
            <Heading level="h2" className={clsx('mb-4')}>
              Saved Searches
            </Heading>
            <section>
              <ButtonLinkGroup
                className={clsx('breadcrumbs')}
                color="info"
                items={Object.entries(searches)}
                toFunction={([path]) => path}
                keyFunction={([path]) => path}
                childFunction={([, parts]) => (
                  <ul>
                    {parts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              />
            </section>
          </>
        )}
      </Container>
    </Layout>
  )
}
