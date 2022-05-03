import axios from 'axios'
import AsyncSelect from 'react-select/async'

interface Props {
  defaultGenres: string[]
}

const searchGenres = async (inputValue: string) =>
  axios
    .get<string[]>('/api/genre', {
      params: {
        q: inputValue,
      },
    })
    .then((resp) =>
      resp.data.map((genre) => ({
        value: genre,
        label: genre,
      }))
    )

const GenreSearchInput: React.FC<Props> = ({ defaultGenres }) => {
  return (
    <AsyncSelect
      name="q"
      cacheOptions={false}
      defaultOptions={defaultGenres.map((genre) => ({
        value: genre,
        label: genre,
      }))}
      loadOptions={searchGenres}
    />
  )
}

export default GenreSearchInput
