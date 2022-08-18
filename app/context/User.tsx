import React from 'react'

export type User = Pick<
  SpotifyApi.CurrentUsersProfileResponse,
  'id' | 'display_name' | 'href' | 'images' | 'uri'
>
const UserContext = React.createContext<User | null>(null)

export default UserContext
