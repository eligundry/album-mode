import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import clsx from 'clsx'

import spotify from '~/lib/spotify'
import { Layout, Container, Typography, Heading } from '~/components/Base'

type LoaderData = {
  categories: Awaited<ReturnType<typeof spotify.getCategories>>
}

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    categories: await spotify.getCategories(),
  }

  return json(data)
}

export default function SpotifyCategories() {
  const { categories } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <Container>
        <Heading level="h2">Categories</Heading>
        <div
          className={clsx('flex', 'flex-row', 'flex-wrap', 'justify-between')}
        >
          {categories.map((category) => (
            <Link
              to={`/category/${category.id}`}
              key={category.id}
              className={clsx('mb-3')}
            >
              <img
                src={category.icons[0].url}
                width={category.icons[0].width}
                height={category.icons[0].height}
                alt={category.name}
                className={clsx('rounded-3xl')}
              />
              <Typography
                variant="hint"
                className={clsx('text-center', 'mt-1')}
              >
                {category.name}
              </Typography>
            </Link>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
