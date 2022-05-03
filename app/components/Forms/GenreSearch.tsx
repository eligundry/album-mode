import { useRef } from 'react'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import { Form } from '@remix-run/react'

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

const GenreSearchForm: React.FC<Props> = ({ defaultGenres }) => {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <Form method="get" action="/genre" ref={formRef}>
      <AsyncSelect
        name="q"
        cacheOptions={false}
        defaultOptions={defaultGenres.map((genre) => ({
          value: genre,
          label: genre,
        }))}
        loadOptions={searchGenres}
        onChange={() => setTimeout(() => formRef.current?.submit(), 10)}
      />
    </Form>
  )
}

export default GenreSearchForm
