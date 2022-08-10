import { useRef } from 'react'
import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import useAsync from 'react-use/lib/useAsync'

import FunSelect from './FunSelect'
import type { SpotifyArtist } from '~/lib/types/spotify'

interface Props {
  className?: string
}

const searchAritsts = async (artist?: string): Promise<SpotifyArtist[]> => {
  const url = new URL(`${window.location.origin}/api/artists`)

  if (artist) {
    url.searchParams.set('artist', artist)
  }

  const resp = await fetch(url.toString())
  const data: SpotifyArtist[] = await resp.json()

  return data
}

const RelatedArtistSearchForm: React.FC<Props> = ({ className }) => {
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)
  const { value: defaultArtists } = useAsync(searchAritsts)

  return (
    <Form
      method="get"
      action="/related-artist"
      className={clsx(className)}
      ref={formRef}
    >
      <FunSelect
        name="artistID"
        defaultOptions={defaultArtists}
        loadOptions={searchAritsts}
        getOptionValue={(option: SpotifyArtist) => option.id}
        formatOptionLabel={(option: SpotifyArtist, meta) => {
          return (
            <div className={clsx('flex', 'flex-row', 'items-center')}>
              {meta.selectValue.length === 0 && option.image && (
                <img
                  className={clsx('w-16', 'mr-2')}
                  src={option.image.url}
                  alt={option.name}
                  width={option.image.width}
                  height={option.image.height}
                />
              )}
              <span>{option.name}</span>
            </div>
          )
        }}
        className={className}
        onChange={() => setTimeout(() => submit(formRef.current), 5)}
      />
    </Form>
  )
}

export default RelatedArtistSearchForm
