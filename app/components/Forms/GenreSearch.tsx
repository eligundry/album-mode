import { useRef } from 'react'
import { ControlProps } from 'react-select'
import AsyncSelect from 'react-select/async'
import { Form } from '@remix-run/react'
import clsx from 'clsx'

import useTailwindTheme, { useDaisyPallete } from '~/hooks/useTailwindTheme'
import { useDarkMode } from '~/hooks/useMediaQuery'

interface Props {
  defaultGenres: string[]
  className?: string
}

const searchGenres = async (genre: string) => {
  const url = new URL(`${window.location.origin}/api/genre`)
  url.searchParams.set('genre', genre)

  const resp = await fetch(url.toString())
  const data: string[] = await resp.json()

  return data.map((genre) => ({
    value: genre,
    label: genre,
  }))
}

const Control: React.FC<ControlProps> = (props) => {
  const { children, className, innerProps, innerRef, isFocused } = props

  return (
    <div
      ref={innerRef}
      className={clsx(
        'input',
        'input-bordered',
        'flex',
        'flex-wrap',
        'items-center',
        'border-box',
        'space-between',
        'relative',
        'pr-0',
        isFocused && 'input-primary',
        className
      )}
      {...innerProps}
    >
      {children}
    </div>
  )
}

const GenreSearchForm: React.FC<Props> = ({ defaultGenres, className }) => {
  const theme = useTailwindTheme()
  const pallete = useDaisyPallete()
  const isDarkMode = useDarkMode()
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <Form
      method="get"
      action="/genre"
      className={clsx(className)}
      ref={formRef}
    >
      <AsyncSelect
        name="genre"
        cacheOptions={false}
        defaultOptions={defaultGenres.map((genre) => ({
          value: genre,
          label: genre,
        }))}
        loadOptions={searchGenres}
        onChange={() => setTimeout(() => formRef.current?.submit(), 10)}
        components={{ Control }}
        styles={{
          input: (styles) => ({
            ...styles,
            color: 'inherit',
          }),
          placeholder: (styles) => ({
            ...styles,
            color: theme.colors.gray[400],
          }),
          valueContainer: (styles) => ({
            ...styles,
            paddingLeft: 0,
            paddingRight: 0,
          }),
          menu: (styles) => ({
            ...styles,
            backgroundColor: pallete['base-100'],
          }),
          option: (styles, options) => {
            let backgroundColor = theme.colors.white
            let color = theme.colors.black

            if (isDarkMode) {
              backgroundColor = pallete['base-100']
              color = theme.colors.white
            }

            if (options.isFocused) {
              backgroundColor = pallete.primary
              color = 'hsl(var(--pc))'
            }

            return {
              ...styles,
              backgroundColor,
              borderColor: isDarkMode ? pallete.neutral : styles.borderColor,
              textTransform: 'capitalize',
              color,
            }
          },
        }}
      />
    </Form>
  )
}

export default GenreSearchForm
