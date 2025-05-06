import { AppMetaFunction, mergeMeta } from '~/lib/remix'

import { Container, Heading } from '~/components/Base'
import FAQ from '~/components/FAQ'
import config from '~/config'

export const meta: AppMetaFunction = ({ matches }) =>
  mergeMeta(matches, [
    { title: `Help | ${config.siteTitle}` },
    {
      name: 'description',
      content: `Answers to commonly asked questions for ${config.siteTitle}`,
    },
  ])

export default function Help() {
  return (
    <Container itemScope itemType="https://schema.org/FAQPage">
      <Heading level="h2">Help</Heading>
      <FAQ
        question="Why does the Spotify widget only play a 30 second snippet of songs?"
        answer={
          <>
            <p>
              This is happening because you are not logged into Spotify in the
              browser. You have a few options to fix this:
            </p>
            <ol>
              <li>Press the Play button to open in the native player.</li>
              <li>Login into Spotify in the browser.</li>
            </ol>
          </>
        }
      />
    </Container>
  )
}
