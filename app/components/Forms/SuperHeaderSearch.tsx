import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import { useCallback, useRef } from 'react'

import type { SpotifyArtist } from '~/lib/types/spotify'
import { cn } from '~/lib/util'

import useUser from '~/hooks/useUser'

import FunSelect, { type Option } from './FunSelect'

interface Props {
  className?: string
}

const SuperHeaderSearch: React.FC<Props> = ({ className }) => {
  const user = useUser()
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)

  const search = useCallback(
    async (term?: string) => {
      const url = new URL(`${window.location.origin}/api/user-search`)

      if (term) {
        url.searchParams.set('search', term)
      }

      const resp = await fetch(url.toString(), {
        credentials: 'include',
      })
      const {
        artists,
        genres,
      }: { artists: SpotifyArtist[]; genres: string[] } = await resp.json()

      let items: Option<{ itemType: string }>[] = []

      if (artists.length) {
        items = items.concat(
          artists.map((artist) => ({
            value: artist.id,
            label: artist.name,
            itemType: 'artist',
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
          })),
        )
      }

      if (genres.length) {
        items = items.concat(
          genres.map((genre) => ({
            value: genre,
            label: genre,
            itemType: 'genre',
          })),
        )
      }

      return items
    },
    [user],
  )

  return (
    <Form method="get" action="/search" className={cn(className)} ref={formRef}>
      <input type="hidden" name="itemType" />
      <FunSelect
        name="itemID"
        placeholder="Search"
        onChange={(option: Option<{ itemType: string }>) => {
          setTimeout(() => {
            if (!formRef.current) {
              return
            }
            // @ts-ignore
            formRef.current.firstChild!.value = option.itemType
            submit(formRef.current)
          }, 5)
        }}
        loadOptions={search}
        className={className}
      />
    </Form>
  )
}

export default SuperHeaderSearch
