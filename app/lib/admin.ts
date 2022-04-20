import kebabCase from 'lodash/kebabCase'
import db from '~/lib/db'

export enum AdminFormActions {
  AddLabel = 'add-label',
  AddArtistGrouping = 'add-artist-grouping',
}

const handleAdminFormSubmission = async (formData: FormData) => {
  const action = formData.get('action')

  switch (action) {
    case AdminFormActions.AddLabel:
      return createLabelFromAdmin(formData)

    case AdminFormActions.AddArtistGrouping:
      return createArtistGrouping(formData)

    default:
      throw new Error(`unknown admin form action '${action}'`)
  }
}

const createArtistGrouping = async (formData: FormData) => {
  const groupName = formData.get('name')

  if (typeof groupName !== 'string') {
    throw new Error('grouping name must be a string')
  }

  let groupSlug = formData.get('slug')

  if (typeof groupSlug !== 'string' || !groupSlug || groupSlug.length === 0) {
    groupSlug = kebabCase(groupName)
  }

  const artists = formData.getAll('artists')

  if (
    artists.some(
      (artist): artist is string =>
        typeof artist !== 'string' || artist.length === 0
    )
  ) {
    throw new Error('all artists must be a string')
  }

  return db.prisma.$transaction(async (prisma) => {
    const group = await prisma.artistGrouping.create({
      data: {
        name: groupName,
        slug: groupSlug as string,
      },
    })

    await Promise.all(
      artists.map((artist) =>
        prisma.artist.create({
          data: {
            groupID: group.id,
            name: artist as string,
          },
        })
      )
    )
  })
}

const createLabelFromAdmin = (data: FormData) => {
  const name = data.get('name')

  if (!name) {
    throw new Error('name is required')
  } else if (typeof name !== 'string') {
    throw new Error('name must be a string')
  }

  const genre = data.get('genre')

  if (typeof genre !== 'string') {
    throw new Error('genre must be supplied')
  }

  let slug = data.get('slug')

  if (typeof slug !== 'string' || !slug) {
    slug = kebabCase(name)
  }

  let displayName = data.get('displayName') || null

  if (displayName && typeof displayName !== 'string') {
    throw new Error('displayName must be a string')
  }

  return db.prisma.label.create({
    data: {
      name,
      slug,
      genre,
      displayName,
    },
  })
}

const api = { handleAdminFormSubmission }

export default api
