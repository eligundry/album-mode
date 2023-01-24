import { Form } from '@remix-run/react'
import clsx from 'clsx'
import { useState } from 'react'

import { AdminFormActions } from '~/lib/types/admin'

import { Button, Fieldset, Input, Legend } from '~/components/Base'

const AddArtistGroupingForm: React.FC = () => {
  const [artistCount, setArtistCount] = useState(1)

  return (
    <Form method="post" reloadDocument>
      <Fieldset flexDirection="column">
        <Legend>Add Artist Grouping</Legend>
        <input
          type="hidden"
          name="action"
          value={AdminFormActions.AddArtistGrouping}
        />
        <Input
          name="name"
          id="group-name"
          placeholder="Group Name (ex: Wu-Tang Clan)"
          width="half"
          required
        />
        <Input
          name="slug"
          id="group-slug"
          placeholder="URL Slug"
          width="half"
        />
        <Fieldset flexDirection="column">
          <Legend>Artists</Legend>
          {[...Array(artistCount).keys()].map((i) => (
            <Input
              key={i}
              name="artists"
              placeholder={`Artist ${i + 1} Name`}
              width="half"
              className={clsx('mb-2')}
              required
            />
          ))}
          <Button
            color="info"
            className="w-1/4"
            onClick={() => setArtistCount((c) => c + 1)}
          >
            Add Artist
          </Button>
        </Fieldset>
        <Button type="submit" className="w-1/4">
          Submit
        </Button>
      </Fieldset>
    </Form>
  )
}

export default AddArtistGroupingForm
