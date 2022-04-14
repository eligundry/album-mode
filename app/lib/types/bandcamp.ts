export interface BandcampAlbum {
  tags?: null[] | null
  artist: string
  title: string
  imageUrl: string
  tracks?: null[] | null
  raw: Raw
  url: string
}
export interface Raw {
  initial_track_num?: null
  has_video?: null
  PAID: number
  is_preorder: boolean
  album_is_preorder: boolean
  album_release_date: string
  licensed_version_ids?: null
  has_discounts: boolean
  packages?: null
  current?: null[] | null
  featured_track_id: number
  client_id_sig?: null
  playing_from: string
  play_cap_data?: null[] | null
  id: number
  artist: string
  freeDownloadPage?: null
  trackinfo?: null[] | null
  use_expando_lyrics: boolean
  tralbum_subscriber_only: boolean
  package_associated_license_id?: null
  'for the curious': string
  url: string
  is_private_stream?: null
  items_purchased?: null
  FREE: number
  is_band_member?: null
  is_bonus?: null
  last_subscription_item?: null
  item_type: string
  art_id: number
  hasAudio: boolean
  defaultPrice: number
  preorder_count?: null
  is_purchased?: null
}
