import type { ReviewedItem, Reviewer } from '../database/schema.server'

export interface Review {
  id: number
  album: string
  artist: string
  service: ReviewedItem['service']
  reviewURL: string
  reviewMetadata: ReviewedItem['metadata']
  publicationName: string
  publicationSlug: string
  publicationMetadata: Reviewer['metadata']
}
