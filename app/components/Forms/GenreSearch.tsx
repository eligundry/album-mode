import { useRef } from 'react'
import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import useAsync from 'react-use/lib/useAsync'

import FunSelect from './FunSelect'

interface Props {
  className?: string
}

const searchGenres = async (genre?: string) => {
  const url = new URL(`${window.location.origin}/api/genre`)

  if (genre) {
    url.searchParams.set('genre', genre)
  }

  const resp = await fetch(url.toString())
  const data: string[] = await resp.json()

  return data.map((genre) => ({
    value: genre,
    label: genre,
  }))
}

const GenreSearchForm: React.FC<Props> = ({ className }) => {
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)
  const { value: defaultGenres } = useAsync(searchGenres)

  return (
    <Form
      method="get"
      action="/genre"
      className={clsx(className)}
      ref={formRef}
    >
      <FunSelect
        name="genre"
        defaultOptions={defaultGenres}
        loadOptions={searchGenres}
        className={className}
        onChange={() => setTimeout(() => submit(formRef.current), 5)}
      />
    </Form>
  )
}

export default GenreSearchForm
