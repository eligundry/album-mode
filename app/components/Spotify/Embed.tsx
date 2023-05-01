// stolen from https://github.com/ctjlewis/react-spotify-embed/blob/master/src/index.tsx
import { HTMLAttributes } from 'react'

interface SpotifyProps extends HTMLAttributes<HTMLIFrameElement> {
  [key: string]: any
  link: string
  allow?: string
}

const Spotify = ({
  link,
  style = {},
  frameBorder = 0,
  allow = 'encrypted-media',
  ...props
}: SpotifyProps) => {
  const url = new URL(link)
  // https://open.spotify.com/track/1KFxcj3MZrpBGiGA8ZWriv?si=f024c3aa52294aa1
  return (
    <iframe
      title="Spotify Web Player"
      src={`https://open.spotify.com/embed${url.pathname}${url.search}`}
      allow={allow}
      style={{
        borderRadius: 8,
        ...style,
      }}
      {...props}
    />
  )
}

export default Spotify
