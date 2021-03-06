import clsx from 'clsx'

import useLibrary from '~/hooks/useLibrary'
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

const Library: React.FC = () => {
  const { library } = useLibrary()

  return (
    <section className={clsx('flex', 'flex-wrap', 'flex-row', 'gap-4')}>
      {library.map((item) => (
        <LibraryCard item={item} key={item.savedAt.toISOString()} />
      ))}
    </section>
  )
}

export default Library
