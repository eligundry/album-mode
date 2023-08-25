import { Form, useSubmit } from '@remix-run/react'
import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { components } from 'react-select'

import type { SpotifyArtist } from '~/lib/types/spotify'

import { useIsMobile } from '~/hooks/useMediaQuery'
import useUser from '~/hooks/useUser'

import FunSelect from './FunSelect'

interface Props {
  className?: string
}

const RelatedArtistSearchForm: React.FC<Props> = ({ className }) => {
  const user = useUser()
  const submit = useSubmit()
  const isMobile = useIsMobile()
  const formRef = useRef<HTMLFormElement>(null)
  const [opened, setOpened] = useState(false)

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
      className={clsx(
        opened && ['phone:modal', 'phone:modal-open', 'phone:modal-top'],
        className,
      )}
      onClickCapture={() => setOpened(true)}
      ref={formRef}
    >
      <div
        className={clsx(
          opened && [
            'phone:modal-box',
            'phone:w-full',
            'phone:max-w-full',
            'phone:transform-none',
            'phone:rounded-t-none',
            'phone:h-[100vh]',
            'phone:p-0',
            'phone:pt-2',
          ],
        )}
      >
        <FunSelect
          name="artistID"
          placeholder="Search for an artist"
          tabIndex={isMobile && opened ? -1 : 0}
          defaultOptions
          onFocus={() => {
            setOpened(true)

            if (isMobile) {
              setTimeout(() => {
                // @ts-ignore
                formRef.current?.querySelector?.('.input input').focus?.()
              }, 2)
            }
          }}
          onChange={(e) => {
            setOpened(false)
            setTimeout(() => submit(formRef.current), 2)
          }}
          loadOptions={searchAritsts}
          menuIsOpen={opened && isMobile ? true : undefined}
          classNames={{
            container: () =>
              clsx(
                opened && [
                  'phone:grid',
                  'phone:grid-cols-8',
                  'phone:auto-cols-min',
                  'phone:content-start',
                  'phone:[&>.input]:mx-3',
                  'phone:[&>.input]:col-span-7',
                ],
              ),
            menu: () =>
              clsx(
                opened && [
                  'phone:!shadow-none',
                  'phone:flex-1',
                  'phone:!static',
                  'phone:order-3',
                  'phone:col-span-8',
                  'phone:z-0',
                  'phone:overflow-y-scroll',
                ],
              ),
            menuList: () => clsx(opened && ['phone:max-h-max']),
          }}
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
          components={{
            DropdownIndicator:
              isMobile && opened ? () => null : components.DropdownIndicator,
            SelectContainer: (props) => {
              return (
                <components.SelectContainer {...props}>
                  {props.children}
                  <button
                    className={clsx(
                      opened && isMobile
                        ? [
                            'phone:order-2',
                            'phone:col-span-1',
                            'phone:btn',
                            'phone:btn-outline',
                            'phone:border-gray-300',
                            'phone:mr-2',
                          ]
                        : 'hidden',
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      setOpened(false)
                    }}
                  >
                    ❌
                  </button>
                </components.SelectContainer>
              )
            },
          }}
        />
      </div>
    </Form>
  )
}

export default RelatedArtistSearchForm
