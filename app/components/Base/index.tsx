import { Slot } from '@radix-ui/react-slot'
import { LinkProps, Link as RemixLink } from '@remix-run/react'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '~/lib/util'

export { default as Layout } from './Layout'
export { default as EmojiText } from './EmojiText'

const headingVariants = cva('', {
  variants: {
    level: {
      h1: 'text-4xl md:text-5xl',
      h2: 'text-3xl md:text-4xl',
      h3: 'text-2xl md:text-3xl',
      h4: 'text-xl md:text-2xl',
      h5: 'uppercase font-bold text-xs',
      h6: 'uppercase text-xs font-bold',
    },
    noSpacing: {
      false: 'my-4',
    },
    noStyles: {
      true: '',
    },
  },
})

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  asChild?: boolean
  noSpacing?: boolean
  noStyles?: boolean
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level,
      asChild,
      className,
      noSpacing = false,
      noStyles = false,
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : level

    return (
      <Component
        ref={ref}
        className={cn(
          headingVariants({
            level: noStyles ? undefined : level,
            noSpacing,
            noStyles,
            className,
          }),
        )}
        {...props}
      />
    )
  },
)

const buttonVariants = cva('btn', {
  variants: {
    color: {
      primary: 'btn-primary',
      secondary: 'btn-info',
      success: 'btn-success',
      info: 'btn-secondary',
      warning: 'btn-warning',
      danger: 'btn-accent',
      reset: '',
    },
    size: {
      lg: 'btn-lg',
      md: 'btn-md',
      sm: 'btn-sm',
      xs: 'btn-xs',
    },
    ghost: {
      true: 'btn-ghost',
    },
    disabled: {
      true: 'btn-disabled',
    },
    loading: {
      true: 'loading',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
})

export type BaseButtonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean
  disabled?: boolean
}

export type ButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color, size, loading, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : 'button'
    return (
      <Component
        ref={ref}
        className={cn(
          buttonVariants({
            color,
            className,
            size,
            loading,
            ...props,
          }),
        )}
        {...props}
      />
    )
  },
)

export const LabelButton = React.forwardRef<
  HTMLLabelElement,
  React.HTMLAttributes<HTMLLabelElement> & BaseButtonProps
>(({ className, color, size, loading, ...props }, ref) => {
  return (
    <Button
      asChild
      color={color}
      size={size}
      loading={loading}
      className={cn(className)}
    >
      <label ref={ref} {...props} />
    </Button>
  )
})

export type ButtonLinkProps = (
  | LinkProps
  | (React.HTMLAttributes<HTMLAnchorElement> & {
      href: string
      target?: string
    })
) &
  BaseButtonProps

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, color, size, loading, ...props }, ref) => {
    if ('href' in props) {
      return (
        <Button
          asChild
          color={color}
          size={size}
          loading={loading}
          className={cn(className)}
        >
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
          <a ref={ref} {...props} />
        </Button>
      )
    }

    return (
      <Button
        asChild
        color={color}
        size={size}
        loading={loading}
        className={cn(className)}
      >
        <RemixLink ref={ref} {...props} />
      </Button>
    )
  },
)

const linkVariants = cva('link link-hover', {
  variants: {
    color: {
      true: '',
    },
    colorHover: {
      true: 'hover:text-primary hover:no-underline',
    },
  },
  compoundVariants: [
    {
      color: true,
      colorHover: false,
      className: 'link-primary',
    },
  ],
  defaultVariants: {
    color: true,
    colorHover: false,
  },
})

export const Link: React.FC<LinkProps & VariantProps<typeof linkVariants>> = ({
  className,
  color = true,
  colorHover = false,
  ...props
}) => (
  <RemixLink
    className={cn(linkVariants({ className, color, colorHover, ...props }))}
    {...props}
  />
)

export const ButtonGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn(className, 'button-group')} {...props} />

const typographyVariants = cva('text-base', {
  variants: {
    variant: {
      base: '',
      hint: 'italic text-gray-400',
      italics: 'italic',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'base',
  },
})

export type TypographyProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof typographyVariants> & {
    asChild?: boolean
  }

export const Typography = React.forwardRef<
  HTMLParagraphElement,
  TypographyProps
>(({ variant = 'base', asChild, className, ...props }, ref) => {
  const Component = asChild ? Slot : 'p'

  return (
    <Component
      ref={ref}
      className={cn(typographyVariants({ variant, className, ...props }))}
      {...props}
    />
  )
})

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  width?: 'full' | 'half'
  name?: string
  required?: boolean
  type?: string
  placeholder?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, width = 'full', ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'input',
        'input-bordered',
        'w-full',
        'focus:outline-primary',
        width === 'half' && ['mb-2', 'w-1/2'],
        className,
      )}
      {...props}
    />
  ),
)

const containerVariants = cva('container mx-auto', {
  variants: {
    center: {
      true: 'text-center flex justify-items-center align-items-center flex-col',
    },
  },
})

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean
  }

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, center, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : 'div'
    return (
      <Component
        ref={ref}
        className={containerVariants({ center, className, ...props })}
        {...props}
      />
    )
  },
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
      className={cn('link', 'link-hover', 'link-primary', className)}
      {...props}
    />
  ),
)

export interface FieldsetProps
  extends React.HTMLAttributes<HTMLFieldSetElement> {
  flexDirection?: 'row' | 'column'
}

export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, flexDirection, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={cn(
        'my-4',
        'p-2',
        'border-2',
        'border-slate',
        {
          'flex flex-row': flexDirection === 'row',
          'flex flex-col': flexDirection === 'column',
        },
        className,
      )}
      {...props}
    />
  ),
)

export const Legend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn('font-bold', 'mb-2', 'px-2', className)}
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
    <label className={cn('label', 'justify-start', 'gap-2')}>
      <input
        className={cn('checkbox', 'checkbox-primary', className)}
        type="checkbox"
        name={name}
        {...props}
      />
      <span className="label-text">{children}</span>
    </label>
  </div>
)
