import { LinkProps, Link as RemixLink } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'

export { default as Layout } from './Layout'
export { default as EmojiText } from './EmojiText'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  noSpacing?: boolean
  noStyles?: boolean
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { level, className, noSpacing = false, noStyles = false, ...props },
    ref
  ) => {
    const Component = level as unknown as React.FC<
      JSX.IntrinsicElements[typeof level]
    >

    return (
      <Component
        ref={ref}
        className={clsx(
          !noStyles && [
            {
              'text-4xl md:text-5xl': level === 'h1',
              'text-3xl md:text-4xl': level === 'h2',
              'text-2xl md:text-3xl': level === 'h3',
              'text-xl md:text-2xl': level === 'h4',
              'uppercase font-bold text-xs': level === 'h5',
              'uppercase text-xs font-bold': level === 'h6',
            },
            !noSpacing && 'my-4',
          ],
          className
        )}
        {...props}
      />
    )
  }
)

export interface ButtonProps<T = HTMLButtonElement>
  extends React.HTMLAttributes<T> {
  color?: 'primary' | 'info' | 'warning' | 'danger'
  size?: 'lg' | 'md' | 'sm' | 'xs'
  ghost?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'reset' | 'submit'
}

function buttonStyles<T>({
  color = 'primary',
  className,
  size,
  ghost,
  disabled,
  loading,
}: ButtonProps<T>) {
  return clsx(
    'btn',
    {
      'btn-primary': color === 'primary',
      'btn-secondary': color === 'info',
      'btn-warning': color === 'warning',
      'btn-accent': color === 'danger',
    },
    {
      'btn-lg': size === 'lg',
      'btn-md': size === 'md',
      'btn-sm': size === 'sm',
      'btn-xs': size === 'xs',
    },
    ghost && 'btn-ghost',
    disabled && 'btn-disabled',
    loading && 'loading',
    className
  )
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps<HTMLButtonElement>
>(({ className, color = 'primary', size = 'md', loading, ...props }, ref) => (
  <button
    ref={ref}
    className={buttonStyles({ color, className, size, loading, ...props })}
    {...props}
  />
))

export const LabelButton = React.forwardRef<
  HTMLLabelElement,
  ButtonProps<HTMLLabelElement>
>(({ className, color = 'primary', size = 'md', loading, ...props }, ref) => (
  <label
    ref={ref}
    className={buttonStyles({ color, className, size, ...props })}
    {...props}
  />
))

export type ButtonLinkProps = (
  | LinkProps
  | (React.HTMLAttributes<HTMLAnchorElement> & {
      href: string
      target?: string
    })
) &
  ButtonProps

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  className,
  ...props
}) => {
  if ('href' in props) {
    /* eslint-disable-next-line jsx-a11y/anchor-has-content */
    return <a className={buttonStyles({ className, ...props })} {...props} />
  }

  return (
    <RemixLink className={buttonStyles({ className, ...props })} {...props} />
  )
}

export const Link: React.FC<
  LinkProps & {
    color?: boolean
    colorHover?: boolean
  }
> = ({ className, color = true, colorHover = false, ...props }) => (
  <RemixLink
    className={clsx(
      'link',
      'link-hover',
      color && !colorHover && 'link-primary',
      colorHover && ['hover:text-primary', 'hover:no-underline'],
      className
    )}
    {...props}
  />
)

export const ButtonGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={clsx(className, 'button-group')} {...props} />

export interface TypographyProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'base' | 'italics' | 'bold' | 'hint'
}

export const Typography = React.forwardRef<
  HTMLParagraphElement,
  TypographyProps
>(({ variant = 'base', className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx(
      'text-base',
      variant === 'hint' && ['italic', 'text-gray-400'],
      variant === 'italics' && 'italic',
      variant === 'bold' && 'font-bold',
      className
    )}
    {...props}
  />
))

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  width?: 'full' | 'half'
  name?: string
  required?: boolean
  type?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, width = 'full', ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'input',
        'input-bordered',
        'w-full',
        'focus:outline-primary',
        width === 'half' && ['mb-2', 'w-1/2'],
        className
      )}
      {...props}
    />
  )
)

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: boolean
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, center, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'container',
        'mx-auto',
        center && [
          'text-center',
          'flex',
          'justify-items-center',
          'align-items-center',
          'flex-col',
        ],
        className
      )}
      {...props}
    />
  )
)

type AProps = React.HTMLAttributes<HTMLHyperlinkElementUtils> & {
  href: string
  target?: string
}

export const A = React.forwardRef<HTMLAnchorElement, AProps>(
  ({ className, ...props }, ref) => (
    /* eslint-disable-next-line jsx-a11y/anchor-has-content */
    <a
      ref={ref}
      className={clsx('link', 'link-hover', 'link-primary', className)}
      {...props}
    />
  )
)

export interface FieldsetProps
  extends React.HTMLAttributes<HTMLFieldSetElement> {
  flexDirection?: 'row' | 'column'
}

export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, flexDirection, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={clsx(
        'my-4',
        'p-2',
        'border-2',
        'border-slate',
        {
          'flex flex-row': flexDirection === 'row',
          'flex flex-col': flexDirection === 'column',
        },
        className
      )}
      {...props}
    />
  )
)

export const Legend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={clsx('font-bold', 'mb-2', 'px-2', className)}
    {...props}
  />
))

export type CheckboxProps = React.HTMLAttributes<HTMLInputElement> & {
  name: string
  value: string
  checked?: boolean
}

export const Checkbox: React.FC<React.PropsWithChildren<CheckboxProps>> = ({
  name,
  className,
  children,
  ...props
}) => (
  <div className="form-control">
    <label className={clsx('label', 'justify-start', 'gap-2')}>
      <input
        className={clsx('checkbox', 'checkbox-primary', className)}
        type="checkbox"
        name={name}
        {...props}
      />
      <span className="label-text">{children}</span>
    </label>
  </div>
)
