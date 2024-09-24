import { z } from 'zod'

export interface IScraperArgs<T> {
  /**
   * For a given item, write it somewhere. If the item is the last one to be
   * written, return false to finish the job.
   *
   */
  onWrite: (item: T) => Promise<boolean>
}

export const albumCsvSchema = z.object({
  reviewer: z.string(),
  list: z.string().optional().nullable().default(null),
  reviewURL: z.string().url(),
  name: z.string(),
  creator: z.string(),
  service: z.enum(['bandcamp', 'spotify']).optional().default('spotify'),
  resolvable: z
    .boolean()
    .optional()
    .default(true)
    .transform((v) => (v === true ? 1 : 0)),
  score: z.number().min(0).max(100).optional().nullable().default(null),
  metadata: z
    .object({
      blurb: z.string().optional(),
      spotify: z
        .object({
          itemType: z.enum(['album', 'track', 'playlist']),
          itemID: z.coerce.string(),
        })
        .optional(),
      bandcamp: z
        .object({
          url: z.string().url(),
          albumID: z.coerce.string(),
          imageURL: z.string().url(),
        })
        .optional(),
    })
    .optional()
    .default({})
    .transform((v) => JSON.stringify(v)),
})
