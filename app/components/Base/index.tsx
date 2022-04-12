import React from 'react'
import { Link, LinkProps } from '@remix-run/react'
import clsx from 'clsx'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const Heading: React.FC<HeadingProps> = ({
  level,
  className,
  ...props
}) => (
  <h1
    className={clsx(
      {
        ['text-5xl']: level === 'h1',
        ['text-4xl']: level === 'h2',
        ['text-3xl']: level === 'h3',
        ['text-2xl']: level === 'h4',
        ['text-xl']: level === 'h5',
        ['text-lg']: level === 'h6',
      },
      className
    )}
    {...props}
  />
)

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'warning' | 'danger'
  size?: 'base' | 'small' | 'large'
}

const buttonStyles = ({
  color = 'primary',
  className,
  size = 'base',
}: ButtonProps) =>
  clsx(
    'text-white',
    'font-bold',
    'rounded',
    {
      ['bg-blue-500 hover:bg-blue-700']: color === 'primary',
      ['bg-yellow-500 hover:bg-yellow-700']: color === 'warning',
      ['bg-red-500 hover:bg-red-700']: color === 'danger',
    },
    {
      ['py-2 px-4']: size === 'base',
    },
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

export const ButtonLink: React.FC<LinkProps & ButtonProps> = ({
  to,
  ...props
}) => <Link to={to} className={buttonStyles(props)} {...props} />

export interface TypographyProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'base' | 'italics' | 'bold'
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'base',
  className,
  ...props
}) => <p className={clsx('text-base', className)} {...props} />
