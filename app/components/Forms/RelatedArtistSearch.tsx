import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import { useCallback, useRef } from 'react'

import type { SpotifyArtist } from '~/lib/types/spotify'

import useUser from '~/hooks/useUser'

import FunSelect, { type Option } from './FunSelect'

interface Props {
  className?: string
}

const RelatedArtistSearchForm: React.FC<Props> = ({ className }) => {
  const user = useUser()
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)

  const searchArtists = useCallback(
    async (artist?: string): Promise<Option[]> => {
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

      return data.map((artist) => ({
        value: artist.id,
        label: artist.name,
        labelElement: (
          <div className={clsx('flex', 'flex-row', 'items-center')}>
            {artist.image && (
              <img
                className={clsx('w-16', 'mr-2', 'rounded-lg')}
                src={artist.image.url}
                alt={artist.name}
                width={artist.image.width}
                height={artist.image.height}
              />
            )}
            <span>{artist.name}</span>
          </div>
        ),
      }))
    },
    [user],
  )

  return (
    <Form
      method="get"
      action="/related-artist"
      className={className}
      ref={formRef}
    >
      <FunSelect
        name="artistID"
        placeholder="Search for an artist"
        onChange={() => {
          setTimeout(() => submit(formRef.current), 5)
        }}
        loadOptions={searchArtists}
        className={className}
      />
    </Form>
  )
}

export default RelatedArtistSearchForm
