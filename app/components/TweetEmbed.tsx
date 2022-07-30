import { TwitterTweetEmbed } from 'react-twitter-embed'
import { useEffect, useState } from 'react'

import { useDarkMode } from '~/hooks/useMediaQuery'
import type { Tweet } from '~/lib/types/twitter'

interface Props {
  tweet: Tweet
}

const TweetEmbed: React.FC<Props> = ({ tweet }) => {
  const [render, setRender] = useState(true)
  const isDarkMode = useDarkMode()

  useEffect(() => {
    setRender(false)
    const timeoutID = window.setTimeout(() => setRender(true), 2)

    return () => {
      window.clearTimeout(timeoutID)
    }
  }, [tweet.tweetID, isDarkMode])

  if (!render) {
    return null
  }

  return (
    <TwitterTweetEmbed
      tweetId={tweet.tweetID}
      options={{
        theme: isDarkMode ? 'dark' : 'light',
        cards: 'hidden',
        conversation: 'none',
      }}
    />
  )
}

export default TweetEmbed
