import React from 'react'
import { Link as RemixLink, LinkProps } from '@remix-run/react'
import clsx from 'clsx'

export { default as Layout } from './Layout'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const Heading: React.FC<HeadingProps> = ({
  level,
  className,
  ...props
}) => {
  const Component = level as JSX.IntrinsicElements[typeof level]

  return (
    <Component
      className={clsx(
        {
          ['text-4xl md:text-5xl']: level === 'h1',
          ['text-3xl md:text-4xl']: level === 'h2',
          ['text-2xl md:text-3xl']: level === 'h3',
          ['text-xl md:text-2xl']: level === 'h4',
          ['text-lg md:text-xl']: level === 'h5',
          ['text-lg']: level === 'h6',
        },
        'my-4',
        className
      )}
      {...props}
    />
  )
}

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'info' | 'warning' | 'danger'
  size?: 'lg' | 'md' | 'sm' | 'xs'
  ghost?: boolean
}

const buttonStyles = ({
  color = 'primary',
  className,
  size,
  ghost,
}: ButtonProps) =>
  clsx(
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
    className
  )

export const Button: React.FC<ButtonProps> = ({
  className,
  color = 'primary',
  size = 'base',
  ...props
}) => (
  <button
    className={buttonStyles({ color, className, size, ...props })}
    {...props}
  />
)

export type ButtonLinkProps = (LinkProps | HTMLAnchorElement) & ButtonProps

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  className,
  ...props
}) => {
  if ('href' in props) {
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
      color && 'link-primary',
      colorHover && [
        'link-neutral',
        'hover:text-primary',
        'hover:no-underline',
      ],
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

export const Typography: React.FC<TypographyProps> = ({
  variant = 'base',
  className,
  ...props
}) => (
  <p
    className={clsx(
      'text-base',
      variant === 'hint' && ['italic', 'text-gray-400'],
      variant === 'italics' && 'italic',
      variant === 'bold' && 'font-bold',
      className
    )}
    {...props}
  />
)

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  width?: 'full' | 'half'
}

export const Input: React.FC<InputProps> = ({
  className,
  width = 'full',
  ...props
}) => (
  <input
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

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  className,
  center,
  ...props
}) => (
  <div
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

export const A: React.FC<React.HTMLAttributes<HTMLAnchorElement>> = ({
  className,
  ...props
}) => (
  <a
    className={clsx('link', 'link-hover', 'link-primary', className)}
    {...props}
  />
)

export interface FieldsetProps
  extends React.HTMLAttributes<HTMLFieldSetElement> {
  flexDirection?: 'row' | 'column'
}

export const Fieldset: React.FC<FieldsetProps> = ({
  className,
  flexDirection,
  ...props
}) => (
  <fieldset
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

export const Legend: React.FC<React.HTMLAttributes<HTMLLegendElement>> = ({
  className,
  ...props
}) => (
  <legend className={clsx('font-bold', 'mb-2', 'px-2', className)} {...props} />
)
