export interface PitchforkSearchResponse {
  count: number
  previous?: null
  next?: null
  results: Results
}
export interface Results {
  category: Category
  list?: ListEntity[] | null
}
export interface Category {
  header: string
  id?: null
  name: string
  bio: string
  mobile_header: string
  social_title: string
  social_description: string
  social_image: string
  url: string
}
export interface ListEntity {
  tombstone: Tombstone
  artists?: ArtistsEntity[] | null
  genres?: GenresEntity[] | null
  channel: string
  subChannel: string
  position: number
  id: string
  url: string
  contentType: string
  title: string
  seoTitle: string
  socialTitle: string
  promoTitle: string
  authors?: AuthorsEntity[] | null
  pubDate: string
  timestamp: number
  modifiedAt: string
  dek: string
  seoDescription: string
  promoDescription: string
  socialDescription: string
  privateTags?: string[] | null
  tags?: (TagsEntity | null)[] | null
}
export interface Tombstone {
  bnm: boolean
  bnr: boolean
  albums?: AlbumsEntity[] | null
}
export interface AlbumsEntity {
  id: string
  album: Album
  rating: Rating
  labels_and_years?: LabelsAndYearsEntity[] | null
}
export interface Album {
  artists?: ArtistsEntity[] | null
  display_name: string
  labels?: LabelsEntity[] | null
  release_year: number
  photos: Photos
}
export interface ArtistsEntity {
  id: string
  display_name: string
  url: string
  genres?: GenresEntity[] | null
  slug: string
  photos: Photos1
}
export interface GenresEntity {
  display_name: string
  slug: string
}
export interface Photos1 {
  tout?: Tout | null
  lede?: boolean | null
  social?: boolean | null
}
export interface Tout {
  width: number
  height: number
  credit: string
  caption: string
  altText: string
  modelName: string
  title: string
  sizes: Sizes
}
export interface Sizes {
  sm: string
  m: string
}
export interface LabelsEntity {
  id: string
  name: string
  display_name: string
}
export interface Photos {
  tout: Tout1
  lede: boolean
  social: boolean
}
export interface Tout1 {
  width: number
  height: number
  credit: string
  caption: string
  altText: string
  title: string
  sizes: Sizes1
}
export interface Sizes1 {
  list: string
  standard: string
  homepageSmall: string
  homepageLarge: string
}
export interface Rating {
  display_rating: string
  rating: string
  bnm: boolean
  bnr: boolean
}
export interface LabelsAndYearsEntity {
  labels?: LabelsEntity[] | null
  year: number
}
export interface AuthorsEntity {
  id: string
  name: string
  title: string
  url: string
  slug: string
}
export interface TagsEntity {
  name: string
  slug: string
}
