import { useRef } from 'react'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import { Form } from '@remix-run/react'

import useTailwindTheme from '~/hooks/useTailwindTheme'
import { useDarkMode } from '~/hooks/useMediaQuery'

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
  const theme = useTailwindTheme()
  const isDarkMode = useDarkMode()
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
        styles={{
          input: (styles) => ({
            ...styles,
            color: isDarkMode ? theme.colors.white : styles.color,
          }),
          control: (styles) => ({
            ...styles,
            backgroundColor: isDarkMode
              ? theme.colors.darkModeInput
              : theme.colors.white,
            borderColor: isDarkMode ? theme.colors.grey : styles.borderColor,
          }),
          menu: (styles) => ({
            ...styles,
            backgroundColor: isDarkMode
              ? theme.colors.darkModeInput
              : theme.colors.white,
          }),
          option: (styles, options) => {
            let backgroundColor = theme.colors.white
            let color = theme.colors.black

            if (isDarkMode) {
              backgroundColor = theme.colors.darkModeInput
              color = theme.colors.white
            }

            if (options.isFocused) {
              backgroundColor = theme.colors.primary
              color = theme.colors.white
            }

            return {
              ...styles,
              backgroundColor,
              borderColor: isDarkMode ? theme.colors.grey : styles.borderColor,
              color,
            }
          },
        }}
      />
    </Form>
  )
}

export default GenreSearchForm
