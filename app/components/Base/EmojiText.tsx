import clsx from 'clsx'

interface Props {
  emoji: string
  label: string
  className?: string
  noPadding?: boolean
}

const EmojiText: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  emoji,
  label,
  className,
  noPadding,
}) => {
  return (
    <>
      <span
        role="img"
        aria-label={label}
        className={clsx(!noPadding && 'pr-2', className)}
      >
        {emoji}
      </span>
      {children}
    </>
  )
}

export default EmojiText
