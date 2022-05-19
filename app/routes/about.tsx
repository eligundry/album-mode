import clsx from 'clsx'
import type { MetaFunction } from '@remix-run/node'
import { Layout, Heading, Typography, Link, A } from '~/components/Base'

export const meta: MetaFunction = () => ({
  title: 'About | Album Mode.party 🎉',
})

export default function About() {
  return (
    <Layout className={clsx('prose', 'dark:prose-invert')}>
      <Heading level="h2">About</Heading>
      <Typography>
        Have you ever headed to your Spotify Discover page and found that all
        it's recommendations are albums that you've already heard or ones that
        you aren't interested in? Are you just so tired of hunting for new music
        that you fallback on a reliable favorite? Wouldn't it be nice if you
        were presented a single album and just listened to it, just like back in
        the days of record stores?
      </Typography>
      <Typography>
        This has been my reality for the past few years. I listen to too much
        music that I've burned through anything good that Spotify could
        recommend to me. Spotify thinks I want more of what I listen to, but, in
        reality, I want music recommendations that I don't know that I'd want or
        even like.
      </Typography>
      <Typography>
        This is why I built <Link to="/">album-mode.party</Link>. It allows me
        to get a random album based upon a search query (like genre or artist)
        or a random highly rated album from a variety of publications. Since
        I've started using it, the amount of new music I have discovered has
        shot through the roof.
      </Typography>
      <Typography>
        Please enjoy and{' '}
        <A href="mailto:eligundry+album-mode.party@gmail.com">
          let me know if there is anything you would like added
        </A>
        !
      </Typography>
      <Heading level="h3">Privacy</Heading>
      <Typography>
        I take your privacy extremely seriously. We use Google Analytics +
        Google Tag Manager only to collect metrics on if you like my
        recommendations or not. If you login with Spotify, I save your access
        token to your cookies locally and retain absolutely no personally
        identifiable information about you on our servers.{' '}
        <strong>
          You are not, nor will you ever be, my funding source for this
          application.
        </strong>
      </Typography>
      <Typography>
        If you have any questions about your privacy on this site,{' '}
        <A href="mailto:eligundry+album-mode.party@gmail.com">
          please contact me
        </A>
        !
      </Typography>
      <Heading level="h3">Legal</Heading>
      <Typography>
        I do not own and am not associated with any publications listed on this
        site. Their names and lists are owned by them and used under fair use. I
        absolutely love all the publications listed and I hope that is
        reciprocated or at least tolerated.
      </Typography>
      <Typography>
        If any publication would like to be scrubbed from this site,{' '}
        <A href="mailto:eligundry+album-mode.party@gmail.com">reach out</A> and
        we can talk about it.
      </Typography>
    </Layout>
  )
}
