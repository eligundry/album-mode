import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import retry from 'async-retry'

import { spotifyStrategy } from '~/lib/auth.server'
import { getRequestContextValues } from '~/lib/context.server'
import { AppMetaFunction, mergeMeta } from '~/lib/remix'
import { forwardServerTimingHeaders } from '~/lib/responses.server'
import spotifyLib, { topArtistSearch } from '~/lib/spotify.server'
import userSettings from '~/lib/userSettings.server'
import wikipedia from '~/lib/wikipedia.server'

import Album from '~/components/Album'
import AlbumErrorBoundary from '~/components/Album/ErrorBoundary'
import { Link } from '~/components/Base'
import type { SearchBreadcrumbsProps } from '~/components/SearchBreadcrumbs'
import config from '~/config'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { serverTiming } = getRequestContextValues(request, context)
  const params = topArtistSearch.parse(new URL(request.url).searchParams)

  await serverTiming.track('spotify.session', () =>
    spotifyStrategy.getSession(request, {
      failureRedirect: config.requiredLoginFailureRedirect,
    }),
  )

  const spotify = await serverTiming.track('spotify.init', () =>
    spotifyLib.initializeFromRequest(request, context),
  )
  const { album, targetArtist } = await retry(async (_, attempt) => {
    const resp = await spotify.getRandomAlbumFromUsersTopArtists(params)
    serverTiming.add({
      label: 'attempts',
      desc: `${attempt} Attempt(s)`,
    })

    return resp
  }, config.asyncRetryConfig)
  const wiki = await serverTiming.track('wikipedia', () =>
    wikipedia.getSummaryForAlbum({
      album: album.name,
      artist: album.artists[0].name,
    }),
  )

  return json(
    {
      album,
      targetArtist,
      wiki,
    },
    {
      headers: {
        'set-cookie': await userSettings.setLastPresented({
          request,
          lastPresented: album.id,
        }),
        [serverTiming.headerKey]: serverTiming.toString(),
      },
    },
  )
}

export const ErrorBoundary = AlbumErrorBoundary
export const headers = forwardServerTimingHeaders
export const meta: AppMetaFunction<typeof loader> = ({ matches }) =>
  mergeMeta(matches, [{ title: `Spotify Top Artists | ${config.siteTitle}` }])

export default function RandomAlbumFromTopArtistOnSpotify() {
  const data = useLoaderData<typeof loader>()
  const headerBreadcrumbs: SearchBreadcrumbsProps['crumbs'] = [
    'Top Artists',
    [
      data.targetArtist.name,
      <Link key="artist-link" to={`/spotify/artist-id/${data.targetArtist.id}`}>
        {data.targetArtist.name}
      </Link>,
    ],
  ]

  return <Album album={data.album} wiki={data.wiki} />
}
