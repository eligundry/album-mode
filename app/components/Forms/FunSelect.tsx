import clsx from 'clsx'
import type { ControlProps } from 'react-select'
import AsyncSelect from 'react-select/async'

import useTailwindTheme from '~/hooks/useTailwindTheme'
import { useDarkMode } from '~/hooks/useMediaQuery'

const FunSelect: React.FC<
  Omit<React.ComponentProps<typeof AsyncSelect>, 'styles'>
> = (props) => {
  const { theme, pallete } = useTailwindTheme()
  const isDarkMode = useDarkMode()

  return (
    <AsyncSelect
      cacheOptions={false}
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
        singleValue: (styles) => ({
          ...styles,
          color: isDarkMode ? theme.colors.white : styles.color,
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
      {...props}
    />
  )
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

export default FunSelect
