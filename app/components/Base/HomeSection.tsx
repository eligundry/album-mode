import clsx from 'clsx'
import { Typography, Heading } from '~/components/Base'

interface Props {
  title: string | React.ReactNode
  subtitle: string | React.ReactNode
  className?: string
}

const HomeSection: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  subtitle,
  children,
  className,
}) => {
  return (
    <section className={clsx(className)}>
      <Heading level="h3" className={clsx('mb-0')}>
        {title}
      </Heading>
      {typeof subtitle === 'string' ? (
        <Typography variant="hint" className={clsx('mb-2')}>
          {subtitle}
        </Typography>
      ) : (
        subtitle
      )}
      {children}
    </section>
  )
}

export default HomeSection
