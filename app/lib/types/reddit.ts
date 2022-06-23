export interface MediaEmbed {
  content: string
  width: number
  scrolling: boolean
  height: number
}

export interface Oembed {
  provider_url: string
  title: string
  html: string
  thumbnail_width: number
  height: number
  width: number
  version: string
  author_name: string
  provider_name: string
  thumbnail_url: string
  type: string
  thumbnail_height: number
  author_url: string
}

export interface SecureMedia {
  oembed: Oembed
  type: string
}

export interface SecureMediaEmbed {
  content: string
  width: number
  scrolling: boolean
  media_domain_url: string
  height: number
}

export interface Gildings {}

export interface Source {
  url: string
  width: number
  height: number
}

export interface Resolution {
  url: string
  width: number
  height: number
}

export interface Variants {}

export interface Image {
  source: Source
  resolutions: Resolution[]
  variants: Variants
  id: string
}

export interface Preview {
  images: Image[]
  enabled: boolean
}

export interface Oembed2 {
  provider_url: string
  title: string
  html: string
  thumbnail_width: number
  height: number
  width: number
  version: string
  author_name: string
  provider_name: string
  thumbnail_url: string
  type: string
  thumbnail_height: number
  author_url: string
}

export interface Media {
  oembed: Oembed2
  type: string
}

export interface Data2 {
  approved_at_utc?: any
  subreddit: string
  selftext: string
  user_reports: any[]
  saved: boolean
  mod_reason_title?: any
  gilded: number
  clicked: boolean
  title: string
  link_flair_richtext: any[]
  subreddit_name_prefixed: string
  hidden: boolean
  pwls: number
  link_flair_css_class?: any
  downs: number
  thumbnail_height: number
  top_awarded_type?: any
  parent_whitelist_status: string
  hide_score: boolean
  name: string
  quarantine: boolean
  link_flair_text_color: string
  upvote_ratio: number
  author_flair_background_color?: any
  subreddit_type: string
  ups: number
  total_awards_received: number
  media_embed: MediaEmbed
  thumbnail_width: number
  author_flair_template_id?: any
  is_original_content: boolean
  author_fullname: string
  secure_media: SecureMedia
  is_reddit_media_domain: boolean
  is_meta: boolean
  category?: any
  secure_media_embed: SecureMediaEmbed
  link_flair_text?: any
  can_mod_post: boolean
  score: number
  approved_by?: any
  is_created_from_ads_ui: boolean
  author_premium: boolean
  thumbnail: string
  edited: boolean
  author_flair_css_class?: any
  author_flair_richtext: any[]
  gildings: Gildings
  post_hint: string
  content_categories?: any
  is_self: boolean
  mod_note?: any
  created: number
  link_flair_type: string
  wls: number
  removed_by_category?: any
  banned_by?: any
  author_flair_type: string
  domain: string
  allow_live_comments: boolean
  selftext_html?: any
  likes?: any
  suggested_sort: string
  banned_at_utc?: any
  url_overridden_by_dest: string
  view_count?: any
  archived: boolean
  no_follow: boolean
  is_crosspostable: boolean
  pinned: boolean
  over_18: boolean
  preview: Preview
  all_awardings: any[]
  awarders: any[]
  media_only: boolean
  can_gild: boolean
  spoiler: boolean
  locked: boolean
  author_flair_text?: any
  treatment_tags: any[]
  visited: boolean
  removed_by?: any
  num_reports?: any
  distinguished?: any
  subreddit_id: string
  author_is_blocked: boolean
  mod_reason_by?: any
  removal_reason?: any
  link_flair_background_color: string
  id: string
  is_robot_indexable: boolean
  num_duplicates: number
  report_reasons?: any
  author: string
  discussion_type?: any
  num_comments: number
  send_replies: boolean
  media: Media
  contest_mode: boolean
  author_patreon_flair: boolean
  author_flair_text_color?: any
  permalink: string
  whitelist_status: string
  stickied: boolean
  url: string
  subreddit_subscribers: number
  created_utc: number
  num_crossposts: number
  mod_reports: any[]
  is_video: boolean
}

export interface Child {
  kind: string
  data: Data2
}

export interface Data {
  after?: any
  dist?: number
  modhash: string
  geo_filter: string
  children: Child[]
  before?: any
}

export interface RandomRedditResponse {
  kind: string
  data: Data
}
