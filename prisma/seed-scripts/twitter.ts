import type { TwitterUser } from '@prisma/client'
import dotenv from 'dotenv'
import { TwitterApi } from 'twitter-api-v2'
import yargs from 'yargs'

import bandcamp from '~/lib/bandcamp.server'
import { prisma } from '~/lib/db.server'
import { getMachineClient as getSpotifyClient } from '~/lib/spotify.server'

import { envSchema } from '~/env.server'

dotenv.config()

type Options = {
  pageLimit?: number
}

const env = envSchema
  .required({
    TWITTER_APP_KEY: true,
    TWITTER_APP_SECRET: true,
    TWITTER_ACCESS_TOKEN: true,
    TWITTER_ACCESS_SECRET: true,
  })
  .parse(process.env)

const pullAlbumsFromTwitterTimeline = async (
  username: string,
  options: Options = {}
) => {
  const spotify = await getSpotifyClient()
  const twitter = await new TwitterApi({
    appKey: env.TWITTER_APP_KEY,
    appSecret: env.TWITTER_APP_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessSecret: env.TWITTER_ACCESS_SECRET,
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
  const promises = []

  do {
    console.log(`processing page ${page}`)
    promises.push(
      Promise.all(
        tweets.tweets.flatMap(async (t) => {
          if (!t.entities?.urls?.length) {
            return
          }

          return Promise.all(
            t.entities.urls.map(async (url) => {
              if (url.expanded_url.includes('daily.bandcamp.com')) {
                return
              }

              if (url.expanded_url.includes('bandcamp.com')) {
                try {
                  var bandcampAlbum = await bandcamp.getAlbum(url.expanded_url)
                } catch (e) {
                  console.warn(
                    `could not pull album from bandcamp for ${url.expanded_url}`,
                    e
                  )
                  return
                }

                try {
                  return prisma.tweetAlbum
                    .create({
                      data: {
                        twitterUserID: user.userID,
                        tweetID: t.id,
                        service: 'bandcamp',
                        itemType: 'album',
                        album: bandcampAlbum.title,
                        albumID: bandcampAlbum.raw.id.toString(),
                        artist: bandcampAlbum.artist,
                        artistID: bandcampAlbum.raw.art_id.toString(),
                        url: url.expanded_url,
                        imageURL: bandcampAlbum.imageUrl,
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
                } catch (e) {
                  console.warn(`could not insert ${url.expanded_url}`, e)
                }
              }

              if (url.expanded_url.includes('open.spotify.com')) {
                const parsedURL = new URL(url.expanded_url)
                const [, itemType, id] = parsedURL.pathname.split('/')
                let album = ''
                let albumID = ''
                let artist = ''
                let artistID = ''
                let imageURL = ''

                try {
                  switch (itemType) {
                    case 'playlist': {
                      const playlist = await spotify.getPlaylist(id)
                      album = playlist.body.name
                      albumID = id
                      artist = playlist.body.owner.display_name ?? ''
                      artistID = playlist.body.owner.id
                      imageURL = playlist.body.images[0].url
                      break
                    }
                    case 'track': {
                      const track = await spotify.getTrack(id)
                      album = track.body.album.name
                      albumID = track.body.album.id
                      artist = track.body.artists[0].name
                      artistID = track.body.artists[0].id
                      imageURL = track.body.album.images[0].url
                      break
                    }
                    case 'album': {
                      const spotifyAlbum = await spotify.getAlbum(id)
                      album = spotifyAlbum.body.name
                      albumID = spotifyAlbum.body.id
                      artist = spotifyAlbum.body.artists[0].name
                      artistID = spotifyAlbum.body.artists[0].id
                      imageURL = spotifyAlbum.body.images[0].url
                      break
                    }
                    default:
                      console.warn(
                        `could not pull Spotify logic for ${url.expanded_url}`
                      )
                      return
                  }
                } catch (e) {
                  console.warn(
                    `could not pull data from spotify for ${url.expanded_url}`,
                    e
                  )
                  return
                }

                try {
                  return prisma.tweetAlbum
                    .create({
                      data: {
                        twitterUserID: user.userID,
                        tweetID: t.id,
                        service: 'spotify',
                        itemType,
                        album,
                        albumID,
                        artist,
                        artistID,
                        url: url.expanded_url,
                        imageURL,
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
                } catch (e) {
                  console.warn(`could not insert ${url.expanded_url}`, e)
                }
              }
            })
          )
        })
      )
    )
    page += 1
  } while (
    (tweets = await tweets.next()) &&
    !tweets.done &&
    (!options.pageLimit || page <= options.pageLimit)
  )

  console.log('finshed fetching tweets, awaiting all data operations')

  await Promise.all(promises)

  console.log(`inserted ${inserted} albums from @${username}'s timeline!`)
}

const main = async () => {
  const args = await yargs
    .scriptName('twitter')
    .option('username', {
      describe: 'Twitter username to pull albums from',
      type: 'string',
    })
    .option('pageLimit', {
      describe: 'Optional limit of pages of Tweets to limit the scraping to',
      type: 'number',
    })
    .demandOption(['username'])
    .help().argv

  await pullAlbumsFromTwitterTimeline(args.username, {
    pageLimit: args.pageLimit,
  })
}

main()
