import { TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'
import type { TwitterUser } from '@prisma/client'
import yargs from 'yargs'

import { prisma } from '~/lib/db'

dotenv.config()

interface TweetAlbum {
  url: string
  artist?: string
  album?: string
  tweetID: string
  imageURL?: string
}

const pullAlbumsFromTwitterTimeline = async (username: string) => {
  const twitter = await new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  }).appLogin()

  try {
    const twitterUser = await twitter.v2.userByUsername(username)
    var user = await prisma.twitterUser.create({
      data: {
        userID: twitterUser.data.id,
        username: twitterUser.data.username,
      },
    })
  } catch (e) {
    var user = (await prisma.twitterUser.findFirst({
      where: {
        username,
      },
    })) as TwitterUser

    if (!user) {
      throw new Error(`could not get twitter user @${username}`)
    }
  }

  let page = 1
  let inserted = 0
  let tweets = await twitter.v2.userTimeline(user.userID, {
    'tweet.fields': ['entities'],
  })

  do {
    console.log(`process page ${page}`)
    await Promise.all(
      tweets.tweets.flatMap(async (t) => {
        if (!t.entities?.urls?.length) {
          return
        }

        return Promise.all(
          t.entities.urls.map((url) => {
            if (url.expanded_url.includes('bandcamp.com')) {
              const [album, artist] = url.title?.split(', by ') ?? [
                undefined,
                undefined,
              ]

              return prisma.tweetAlbum
                .create({
                  data: {
                    twitterUserID: user.userID,
                    tweetID: t.id,
                    service: 'bandcamp',
                    album,
                    artist,
                    url: url.expanded_url,
                    imageURL: url.images?.[0].url,
                  },
                })
                .then((album) => {
                  inserted += 1
                  return album
                })
                .catch((e) => {
                  if (!e.message.includes('Unique constraint failed')) {
                    console.warn(
                      `could not insert ${url.expanded_url}`,
                      e.message
                    )
                  }
                })
            }

            if (url.expanded_url.includes('open.spotify.com')) {
              const album = url.title
              const artist = url.description?.split(' · ').at(0)

              return prisma.tweetAlbum
                .create({
                  data: {
                    twitterUserID: user.userID,
                    tweetID: t.id,
                    service: 'spotify',
                    album,
                    artist,
                    url: url.expanded_url,
                    imageURL: url.images?.[0].url,
                  },
                })
                .then((album) => {
                  inserted += 1
                  return album
                })
                .catch((e) => {
                  if (!e.message.includes('Unique constraint failed')) {
                    console.warn(
                      `could not insert ${url.expanded_url}`,
                      e.message
                    )
                  }
                })
            }
          })
        )
      })
    )
    page += 1
  } while ((tweets = await tweets.next()) && !tweets.done)

  console.log(`inserted ${inserted} albums from @${username}'s timeline!`)
}

const main = async () => {
  const args = await yargs
    .scriptName('twitter')
    .option('username', {
      describe: 'Twitter username to pull albums from',
      type: 'string',
    })
    .demandOption(['username'])
    .help().argv

  await pullAlbumsFromTwitterTimeline(args.username)
}

main()
