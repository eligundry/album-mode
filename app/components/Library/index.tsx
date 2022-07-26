import type { SavedLibraryItem } from '~/lib/types/library'
import BandcampLibraryCard from './Bandcamp'
import SpotifyLibraryCard from './Spotify'

const LibraryCard: React.FC<{ item: SavedLibraryItem }> = ({ item }) => {
  switch (item.type) {
    case 'bandcamp':
      return <BandcampLibraryCard item={item} />
    case 'playlist':
    case 'album':
      return <SpotifyLibraryCard item={item} />
  }
}

export default LibraryCard
