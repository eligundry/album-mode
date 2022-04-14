import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Layout, Container, Typography, A } from '~/components/Base'
import BandcampAlbum from '~/components/Album/Bandcamp'

import db from '~/lib/db'

type LoaderData = {
  album: Awaited<ReturnType<typeof db.getRandomBandcampDailyAlbum>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    throw new Error('slug must be provided in URL')
  }

  const data: LoaderData = {
    album: await db.getRandomBandcampDailyAlbum(),
  }

  return json(data)
}

export default function BandcampDaily() {
  const { album } = useLoaderData<LoaderData>()

  if (!album) {
    return null
  }

  return (
    <Layout>
      <Container>
        <BandcampAlbum
          albumID={album.albumID}
          album={album.album}
          artist={album.artist}
          url={album.bandcampDailyURL}
          footer={
            <Typography className={clsx('my-4')}>
              Need convincing? Read the{' '}
              <A href={album.bandcampDailyURL} target="_blank">
                Bandcamp Daily review
              </A>
              .
            </Typography>
          }
        />
      </Container>
    </Layout>
  )
}
