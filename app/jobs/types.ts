export interface IScraperArgs<T> {
  /**
   * For a given item, write it somewhere. If the item is the last one to be
   * written, return false to finish the job.
   *
   */
  onWrite: (item: T) => Promise<boolean>
}
