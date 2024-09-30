import { A, Heading } from '~/components/Base'
import useUTM from '~/hooks/useUTM'

interface Props {
  publicationSlug: string
  publicationName: string
  reviewURL: string | null
  className?: string
}

const ReviewLink: React.FC<Props> = ({
  publicationSlug,
  publicationName,
  reviewURL,
  className,
}) => {
  const { createExternalURL } = useUTM()

  if (!reviewURL?.startsWith('http')) {
    return null
  }

  const url = createExternalURL(reviewURL)

  if (publicationSlug === 'pitchfork') {
    return (
      <Heading level="h5" noSpacing className={className}>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
      </Heading>
    )
  } else if (publicationSlug === 'needle-drop') {
    return (
      <Heading level="h5" noSpacing className={className}>
        Watch the{' '}
        <A href={url.toString()} target="_blank">
          Needle Drop review on YouTube
        </A>
      </Heading>
    )
  } else if (publicationSlug === '33-13-sound') {
    return (
      <Heading level="h5" noSpacing className={className}>
        Buy the{' '}
        <A href={url.toString()} target="_blank">
          {publicationName} book
        </A>{' '}
        about this album
      </Heading>
    )
  } else if (publicationSlug === 'robert-christgau') {
    return (
      <Heading level="h5" noSpacing className={className}>
        {url.pathname.includes('get_album.php') ? (
          <>
            Read{' '}
            <A href={url.toString()} target="_blank">
              {publicationName}'s Consumer Guide™️{' '}
            </A>{' '}
            for this album
          </>
        ) : (
          <>
            Read{' '}
            <A href={url.toString()} target="_blank">
              {publicationName}'s musings
            </A>{' '}
            about this artist
          </>
        )}
      </Heading>
    )
  } else if (publicationSlug === 'resident-advisor') {
    return (
      <Heading level="h5" noSpacing className={className}>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Resident Advisor Review
        </A>
      </Heading>
    )
  } else if (
    publicationSlug === 'bandcamp-daily' &&
    reviewURL.startsWith('https://')
  ) {
    return (
      <Heading level="h5" noSpacing className={className}>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Bandcamp Daily review
        </A>
      </Heading>
    )
  } else {
    return (
      <Heading level="h5" noSpacing className={className}>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          {publicationName} review
        </A>
      </Heading>
    )
  }
}

export default ReviewLink
