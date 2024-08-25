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
  reviewURL: z.string().url(),
  name: z.string(),
  creator: z.string(),
  service: z.enum(['bandcamp', 'spotify']).optional().default('spotify'),
  resolvable: z
    .boolean()
    .optional()
    .default(true)
    .transform((v) => (v === true ? 1 : 0)),
  score: z.number().optional(),
  metadata: z
    .object({
      blurb: z.string().optional(),
      spotify: z.object({}),
      bandcamp: z
        .object({
          url: z.string().url(),
          albumID: z.string(),
        })
        .optional(),
    })
    .transform((v) => JSON.stringify(v)),
})
