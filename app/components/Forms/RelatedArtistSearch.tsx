import { Form } from '@remix-run/react'

import { Input } from '~/components/Base'

const RelatedArtistSearchForm: React.FC = () => {
  return (
    <Form method="get" action="/related-artist">
      <Input name="q" type="search" placeholder="Search for artist" />
    </Form>
  )
}

export default RelatedArtistSearchForm
