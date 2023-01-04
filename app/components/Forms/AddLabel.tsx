import { Form } from '@remix-run/react'
import clsx from 'clsx'

import { Button, Fieldset, Input, Legend } from '~/components/Base'

const AddLabelForm: React.FC = () => {
  return (
    <Form method="post" reloadDocument>
      <Fieldset className={clsx('flex', 'flex-col')}>
        <Legend>Add Label</Legend>
        <input type="hidden" name="action" value="new-label" />
        <Input
          name="name"
          id="name"
          placeholder="Label name"
          required
          width="half"
        />
        <Input
          name="displayName"
          id="displayName"
          placeholder="Display Name"
          width="half"
        />
        <Input
          name="genre"
          id="genre"
          placeholder="Genre (ex: Hip-Hop, Indie Rock)"
          required
          width="half"
        />
        <Input name="slug" id="slug" placeholder="URL Slug" width="half" />
        <Button type="submit" className={clsx('w-1/4')}>
          Submit
        </Button>
      </Fieldset>
    </Form>
  )
}

export default AddLabelForm
