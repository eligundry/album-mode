import { json, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'

import db from '~/lib/db.server'
import config from '~/config'
import { Layout, Heading, Container } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import LabelSearchForm from '~/components/Forms/LabelSearch'
import {
  GenericErrorBoundary,
  GenericCatchBoundary,
} from '~/components/ErrorBoundary'

export async function loader() {
  return json({
    labels: await db.getLabels(),
  })
}

export const meta: MetaFunction = () => ({
  title: `Labels 🏷 | ${config.siteTitle}`,
})

export const ErrorBoundary = GenericErrorBoundary
export const CatchBoundary = GenericCatchBoundary

export default function LabelSearch() {
  const data = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Search by Label</Heading>
        <LabelSearchForm />
        {Object.entries(data.labels).map(([category, labels]) => (
          <section key={category}>
            <Heading level="h4">{category}</Heading>
            <ButtonLinkGroup
              items={labels}
              toFunction={(label) => `/label/${label.slug}`}
              keyFunction={(label) => label.slug}
              childFunction={(label) => label?.displayName ?? label.name}
            />
          </section>
        ))}
        <a
          href="https://genius.com/Gza-labels-lyrics"
          target="_blank"
          className={clsx('block', 'w-3/4', 'mx-auto', 'mt-2')}
        >
          <img
            src="/img/rza-labels.png"
            alt={`Genius lyric cover with the GZA, RZA & Bill Murray saying "You gotta read the label / If you don't read the Label, you might get poisoned" from the GZA song "Labels"`}
          />
        </a>
      </Container>
    </Layout>
  )
}
