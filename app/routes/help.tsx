import { Layout, Heading, Container } from '~/components/Base'
import FAQ from '~/components/FAQ'

export default function Help() {
  return (
    <Layout>
      <Container>
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
    </Layout>
  )
}
