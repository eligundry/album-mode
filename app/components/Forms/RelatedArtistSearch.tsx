import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import { useRef } from 'react'
import useAsync from 'react-use/lib/useAsync'

import type { SpotifyArtist } from '~/lib/types/spotify'

import { ButtonLink } from '~/components/Base'

import FunSelect from './FunSelect'

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
        menuIsOpen={true}
        // @ts-ignore
        getOptionValue={(option: SpotifyArtist) => option.id}
        // @ts-ignore
        formatOptionLabel={(option: SpotifyArtist, meta) => {
          console.log({ option, meta })
          return (
            <div
              className={clsx(
                'flex',
                'flex-row',
                'items-center',
                'justify-between',
                '[&>.btn-sm]:hidden',
                'hover:[&>.btn-sm]:flex'
              )}
            >
              <div
                className={clsx('flex', 'flex-row', 'items-center', 'gap-2')}
              >
                {meta.selectValue.length === 0 && option.image && (
                  <img
                    className={clsx('w-16', 'rounded-lg')}
                    src={option.image.url}
                    alt={option.name}
                    width={option.image.width}
                    height={option.image.height}
                    loading="lazy"
                  />
                )}
                <span>{option.name}</span>
              </div>
              <ButtonLink
                to={`/related-artist?artistID="${option.id}"`}
                onClick={(e) => e.stopPropagation()}
                className={clsx('btn-sm', 'btn-secondary')}
              >
                Exact Search
              </ButtonLink>
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
