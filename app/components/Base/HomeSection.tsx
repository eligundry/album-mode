import { cn } from '~/lib/util'

import { Heading, Typography } from '~/components/Base'

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
    <section className={cn(className)}>
      <Heading level="h3" className={cn('mb-0')}>
        {title}
      </Heading>
      {typeof subtitle === 'string' ? (
        <Typography variant="hint" className={cn('mb-2')}>
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
