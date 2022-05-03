import { Form } from '@remix-run/react'
import clsx from 'clsx'

import { Input } from '~/components/Base'

const LabelSearchForm: React.FC = () => {
  return (
    <Form method="get" action="/label">
      <Input
        name="q"
        type="search"
        placeholder="Search for label (ex: OVO)"
        className={clsx('mb-4')}
      />
    </Form>
  )
}

export default LabelSearchForm
