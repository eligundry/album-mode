import { useEffect, useState } from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { useDarkMode } from '~/hooks/useMediaQuery'

interface Props {
  tweetID: string
}

const TweetEmbed: React.FC<Props> = ({ tweetID }) => {
  const [render, setRender] = useState(true)
  const isDarkMode = useDarkMode()

  // TwitterTweetEmbed does not refresh automatically when the tweet ID or dark
  // mode changes, so this will force it to do so.
  useEffect(() => {
    setRender(false)
    const timeoutID = window.setTimeout(() => setRender(true), 2)

    return () => {
      window.clearTimeout(timeoutID)
    }
  }, [tweetID, isDarkMode])

  if (!render) {
    return null
  }

  return (
    <TwitterTweetEmbed
      tweetId={tweetID}
      options={{
        theme: isDarkMode ? 'dark' : 'light',
        cards: 'hidden',
        conversation: 'none',
      }}
    />
  )
}

export default TweetEmbed
