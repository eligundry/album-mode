import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import {
  ButtonLink,
  Container,
  EmojiText,
  Heading,
  Layout,
} from '~/components/Base'
import BrowseSections from '~/components/BrowseSections'
import { PageErrorBoundary } from '~/components/ErrorBoundary'
import config from '~/config'
import useLoading from '~/hooks/useLoading'

export async function loader({ context: { database } }: LoaderArgs) {
  return json(
    { publications: await database.getPublications() },
    {
      headers: {
        'Cache-Control': config.cacheControl.public,
      },
    },
  )
}

export const ErrorBoundary = PageErrorBoundary

export default function Browse() {
  const data = useLoaderData<typeof loader>()
  const { loading } = useLoading()

  return (
    <Layout className={clsx('mt-0')}>
      <Container>
        <div className={clsx('hero', 'place-items-start')}>
          <div
            className={clsx('hero-content', 'flex', 'flex-row-reverse', 'p-0')}
          >
            <img
              src="/img/dancing.png"
              alt="man dancing to music"
              className={clsx('w-48', 'hidden', 'md:block')}
              width={296}
              height={400}
            />
            <div>
              <Heading level="h2" className={clsx('font-black')}>
                It's time for new music
              </Heading>
              <p className={clsx('pb-4')}>
                Tired of the same old songs? <br />
                Spotify's algorithim know you too well? <br />
                Take a chance on a random album!
              </p>
              <ButtonLink to="/random" disabled={loading}>
                <EmojiText emoji="▶️" label="play button">
                  Play me someting
                </EmojiText>
              </ButtonLink>
            </div>
          </div>
        </div>
        <BrowseSections publications={data.publications} />
      </Container>
    </Layout>
  )
}
