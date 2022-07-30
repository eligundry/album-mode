import { TweetAlbum, TwitterUser } from '@prisma/client'

export type Tweet = Pick<TwitterUser, 'username' | 'userID'> &
  Pick<
    TweetAlbum,
    | 'tweetID'
    | 'service'
    | 'itemType'
    | 'album'
    | 'albumID'
    | 'artist'
    | 'artistID'
    | 'url'
    | 'imageURL'
  >
