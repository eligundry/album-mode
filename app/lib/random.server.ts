import { DatabaseClient } from './database/index.server'
import { Spotify } from './spotify.server'
import wikipedia from './wikipedia.server'

export default class RandomRecommendation {
  constructor(
    private spotify: Spotify,
    private db: DatabaseClient,
  ) {
    this.spotify = spotify
    this.db = db
  }

  public async forAnyPublication() {
    const publication = await this.db.getRandomPublication()
    const review = await this.db.getRandomReviewedItem({
      reviewerSlug: publication,
    })
    const album = await this.spotify.getAlbum(review.album, review.artist)
    const wiki = await wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })

    return { review, album, wiki }
  }

  public async forFeaturedPlaylist() {
    return this.spotify.getRandomFeaturedPlaylist()
  }

  public async forUsersTopArtists(relations: boolean) {
    const { album, targetArtist } =
      await this.spotify.getRandomAlbumFromUsersTopArtists({
        timeRange: undefined,
        related: relations,
      })
    const wiki = await wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    })

    return { album, wiki, targetArtist }
  }
}
