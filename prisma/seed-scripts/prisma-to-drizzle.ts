import { PrismaClient } from '@prisma/client'
import { eq } from 'drizzle-orm'

import {
  db,
  reviewedItems,
  reviewers,
  spotifyGenres,
} from '~/lib/database/index.server'

const prisma = new PrismaClient()

async function main() {
  // Clear the database
  await Promise.all(
    [reviewedItems, reviewers, spotifyGenres].map((table) =>
      db.delete(table).run()
    )
  )

  // Port the Spotify genres
  const genres = await prisma.spotifyGenre.findMany()

  db.transaction((tx) => {
    for (const genre of genres) {
      tx.insert(spotifyGenres).values({ name: genre.name }).run()
    }
  })

  // Port the publication reviewers
  const publications = await prisma.publication.findMany()

  db.transaction((tx) => {
    for (const publication of publications) {
      const metadata: (typeof reviewers)['metadata']['_']['data'] = {}

      if (publication.url) {
        metadata.url = publication.url
      }

      if (publication.metaDescription) {
        metadata.metaDescription = publication.metaDescription
      }

      tx.insert(reviewers)
        .values({
          id: publication.id,
          name: publication.name,
          slug: publication.slug,
          service: 'publication',
          createdAt: publication.createdAt,
          metadata,
        })
        .run()
    }
  })

  // Port the reviews from the publications
  const albums = await prisma.albumReviewedByPublication.findMany()

  db.transaction((tx) => {
    for (const album of albums) {
      const metadata: (typeof reviewedItems)['metadata']['_']['data'] = {}

      if (album.reviewUnresolvabe) {
        metadata.reviewUnresolvable = true
      }

      tx.insert(reviewedItems)
        .values({
          reviewerID: album.publicationID,
          reviewURL: album.slug.trim(),
          name: album.album.trim(),
          creator: album.artist.trim(),
          service: 'spotify',
          resolvable: album.resolvable ? 1 : 0,
          createdAt: album.createdAt,
          metadata,
        })
        .run()
    }
  })

  // Port Bandcamp Daily reviews
  const bandcampDailies = await prisma.bandcampDailyAlbum.findMany()

  db.transaction((tx) => {
    const bandcampReviewer = db
      .select({ id: reviewers.id, metadata: reviewers.metadata })
      .from(reviewers)
      .where(eq(reviewers.slug, 'bandcamp-daily'))
      .limit(1)
      .get()

    tx.update(reviewers).set({
      metadata: {
        ...bandcampReviewer.metadata,
        metaDescription:
          "Listen to something good according to Bandcamp's staff",
      },
    })

    for (const album of bandcampDailies) {
      tx.insert(reviewedItems)
        .values({
          reviewerID: bandcampReviewer.id,
          reviewURL: album.bandcampDailyURL,
          name: album.album,
          creator: album.artist,
          service: 'bandcamp',
          resolvable: 1,
          createdAt: album.createdAt,
          metadata: {
            bandcampURL: album.url,
            imageURL: album.imageURL,
          },
        })
        .run()
    }
  })

  // Port the albums reviewed by Twitter users
  const twitterUsers = await prisma.twitterUser.findMany()

  db.transaction(async (tx) => {
    for (const user of twitterUsers) {
      const reviewer = tx
        .insert(reviewers)
        .values({
          name: user.username,
          slug: user.username,
          service: 'twitter',
          metadata: {
            twitterUserID: user.userID,
          },
          createdAt: user.createdAt,
        })
        .run()

      const tweets = await prisma.tweetAlbum.findMany({
        where: {
          twitterUserID: user.userID,
        },
      })

      for (const tweet of tweets) {
        const metadata: (typeof reviewedItems)['metadata']['_']['data'] = {
          // @ts-ignore
          spotifyItemType: tweet.itemType,
          imageURL: tweet.imageURL,
        }

        if (tweet.service === 'spotify') {
          metadata.spotifyItemID = tweet.albumID
        } else {
          metadata.bandcampURL = tweet.url
        }

        try {
          // @ts-ignore
          tx.insert(reviewedItems)
            .values({
              reviewerID: reviewer.lastInsertRowid as number,
              reviewURL: `https://twitter.com/${user.username}/status/${tweet.tweetID}?og_id=${tweet.albumID}`,
              name: tweet.album,
              creator: tweet.artist,
              service: tweet.service,
              resolvable: 1,
              metadata,
              createdAt: tweet.createdAt,
            })
            .run()
        } catch (e) {}
      }
    }
  })
}

main()
