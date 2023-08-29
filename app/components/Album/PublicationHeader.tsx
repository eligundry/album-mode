import type { Review } from '~/lib/types/review'

import { A, Heading } from '~/components/Base'
import useUTM from '~/hooks/useUTM'

interface Props {
  slug: string
  review: Review
}

const PublicationHeader: React.FC<Props> = ({ slug, review }) => {
  const { createExternalURL } = useUTM()

  if (!review.reviewURL.startsWith('http')) {
    return null
  }

  const url = createExternalURL(review.reviewURL)
  let text: React.ReactNode = ''

  if (slug.includes('p4k')) {
    text = (
      <>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Pitchfork Review
        </A>
      </>
    )
  } else if (slug === 'needle-drop') {
    text = (
      <>
        Watch the{' '}
        <A href={url.toString()} target="_blank">
          Needle Drop review on YouTube
        </A>
      </>
    )
  } else if (slug === '33-13-sound') {
    text = (
      <>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          {review.publicationName} book
        </A>{' '}
        about this album
      </>
    )
  } else if (slug === 'robert-christgau') {
    if (url.pathname.includes('get_album.php')) {
      text = (
        <>
          Read{' '}
          <A href={url.toString()} target="_blank">
            {review.publicationName}'s Consumer Guide™️{' '}
          </A>{' '}
          for this album
        </>
      )
    } else {
      text = (
        <>
          Read{' '}
          <A href={url.toString()} target="_blank">
            {review.publicationName}'s musings
          </A>{' '}
          about this artist
        </>
      )
    }
  } else if (slug === 'resident-advisor') {
    text = (
      <>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Resident Advisor Review
        </A>
      </>
    )
  } else if (slug === 'bandcamp-daily') {
    text = (
      <>
        Read the{' '}
        <A href={url.toString()} target="_blank">
          Bandcamp Daily review
        </A>
      </>
    )
  }

  return (
    <Heading level="h5" noSpacing className="my-2">
      {text}
    </Heading>
  )
}

export default PublicationHeader
