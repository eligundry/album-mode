import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { useMountEffect } from '@react-hookz/web'
import { useCallback, useState } from 'react'

import { cn } from '~/lib/util'

export interface Option {
  label?: string
  labelElement?: React.ReactNode
  value: string
}

interface FunSelectProps {
  name: string
  label?: string
  value?: Option
  className?: string
  placeholder?: string
  loadOptions: (query?: string) => Promise<Option[]>
  onChange: (value?: Option) => void
}

const FunSelect: React.FC<FunSelectProps> = ({
  name,
  label,
  value,
  className,
  placeholder,
  loadOptions,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([])
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)

  useMountEffect(() => {
    loadOptions().then(setOptions)
  })

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.target.value === '') {
        event.preventDefault()
      }

      loadOptions(event.target.value).then(setOptions)
    },
    [loadOptions],
  )

  return (
    <Combobox
      immediate
      value={value}
      onChange={(option) => {
        onChange(option ?? undefined)
        setSelectedOption(option)
      }}
      as="div"
    >
      <ComboboxInput
        name={name}
        aria-label={label}
        displayValue={(option: Option) =>
          option?.label ?? option?.value ?? undefined
        }
        value={selectedOption?.value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'input',
          'input-bordered',
          'flex',
          'flex-wrap',
          'items-center',
          'border-box',
          'space-between',
          'relative',
          'pr-0',
          'focus:input-primary',
          'w-full',
          className,
        )}
      />
      <ComboboxOptions
        anchor={{
          to: 'bottom start',
          gap: 6,
        }}
        className={cn(
          'empty:hidden',
          'bg-base-100',
          'rounded',
          'shadow',
          'mx-1',
        )}
      >
        {options.map((option) => (
          <ComboboxOption
            key={option.value}
            value={option}
            className={cn('data-[focus]:bg-primary-focus p-2 cursor-pointer')}
          >
            {option.labelElement ?? option.label ?? option.value}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  )
}

export default FunSelect
