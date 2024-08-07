import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import uniqBy from 'lodash/uniqBy'

import type { loader } from '~/root'

export type AppMetaFunction<Loader extends LoaderFunction | unknown = unknown> =
  MetaFunction<Loader, { root: typeof loader }>

type MetaDescriptor = ReturnType<MetaFunction>
type Matches = Parameters<AppMetaFunction>[0]['matches']

export function mergeMeta(
  matches: Matches,
  meta: MetaDescriptor,
): MetaDescriptor {
  // @ts-ignore
  const allMeta = [...meta, ...matches.flatMap((m) => m.meta)]
  const merged = uniqBy(allMeta, (m) => {
    if ('title' in m) {
      return 'title'
    }

    return m
  })

  return merged
}
