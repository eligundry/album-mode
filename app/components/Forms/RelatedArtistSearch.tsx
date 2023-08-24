import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import { useCallback, useRef } from 'react'

import type { SpotifyArtist } from '~/lib/types/spotify'

import useUser from '~/hooks/useUser'

import FunSelect from './FunSelect'

interface Props {
  className?: string
}

const RelatedArtistSearchForm: React.FC<Props> = ({ className }) => {
  const user = useUser()
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)

  const searchAritsts = useCallback(
    async (artist?: string): Promise<SpotifyArtist[]> => {
      const url = new URL(`${window.location.origin}/api/artists`)

      if (artist) {
        url.searchParams.set('artist', artist)
      } else if (user) {
        url.pathname = '/api/user-artists'
      }

      const resp = await fetch(url.toString(), {
        credentials: 'include',
      })
      const data: SpotifyArtist[] = await resp.json()

      return data
    },
    [user],
  )

  return (
    <Form
      method="get"
      action="/related-artist"
      className={clsx(className)}
      ref={formRef}
    >
      <FunSelect
        name="artistID"
        defaultOptions
        loadOptions={searchAritsts}
        // @ts-ignore
        getOptionValue={(option: SpotifyArtist) => option.id}
        // @ts-ignore
        formatOptionLabel={(option: SpotifyArtist, meta) => {
          return (
            <div className={clsx('flex', 'flex-row', 'items-center')}>
              {meta.selectValue.length === 0 && option.image && (
                <img
                  className={clsx('w-16', 'mr-2', 'rounded-lg')}
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
