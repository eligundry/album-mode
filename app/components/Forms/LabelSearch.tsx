import { Form } from '@remix-run/react'

import { Input } from '~/components/Base'

const LabelSearchForm: React.FC = () => {
  return (
    <Form method="get" action="/label">
      <Input name="q" type="search" placeholder="Search for label (ex: OVO)" />
    </Form>
  )
}

export default LabelSearchForm
